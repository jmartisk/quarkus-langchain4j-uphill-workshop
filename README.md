# Quarkus-LangChain4j Workshop

### What you need for this workshop
- JDK 17.0 or later
- A key for OpenAI API
- Optional: a key for Cohere API (you can get it here) if you want to add reranking at the end

Good to know:

1. To run the application in dev mode:
```shell script
./mvnw compile quarkus:dev
```

2. Open the app at http://localhost:8080/.
> **_NOTE:_**  Quarkus now ships with a Dev UI, which is available in dev mode only at http://localhost:8080/q/dev/.

3. For debugging a running Quarkus application, put your breakpoints and select Run > Attach to Process, then select the Quarkus process (in IntelliJ)

## How this workshop works
During this workshop we will create an LLM-powered customer support agent chatbot for a car rental company in 7 steps. We start from the base functionality (step 1) and add features in the subsequent steps.
The starting point is step 1 (commit 95eb682303ac78d2caea3efa5cbfcf7acdca903a) which you can check out as follows:
```shell
git checkout 95eb682303ac78d2caea3efa5cbfcf7acdca903a
```

You can try to solve the workshop yourself, but in case you get stuck you can always check out a later commit and continue from there, or check out the final solution using
```shell
git checkout main
```

### If you want to jump to any specific step

Step 1: Basic customer support agent
```shell
git checkout 95eb682303ac78d2caea3efa5cbfcf7acdca903a
```
Step 2: Customizing model parameters
```shell
git checkout 7a3921c12e61439e3d67ecdc887cd4d6a2770f8c
```
Step 3: Enabling response streaming
```shell
git checkout 8d92ca5d2408bc55b76ce06876802d831510f4d5
```
Step 4: Using system message (prompt)
```shell
c24cf7c3f3e2c4d740659d6c345c200bb523ee6a
```
Step 5: Enabling Easy RAG
```shell
git checkout 4b84890523da6a5b44b80b2782a82ba659b31cc8
```
Step 6: Using tools
```shell
4b84890523da6a5b44b80b2782a82ba659b31cc8
```
Step 7: Enabling Advanced RAG: query transformation and re-ranking
```shell
git checkout main
```

Attention! When checking out another commit after you made local changes, you have to stash or trash your changes. Trashing them would work like this:
```shell
git restore .
```
> **_NOTE:_** This will make you lose all your local changes!

Before actually starting the workshop, make sure you have set the OpenAI API
key as an environment variable: 

```shell
export QUARKUS_LANGCHAIN4J_OPENAI_API_KEY=<your-key>
```

and if you're going to use Cohere for reranking, you'll also need the Cohere API key:
```shell
export QUARKUS_LANGCHAIN4J_COHERE_API_KEY=<your-key>
```

Let's get started!

## STEP 1
To get started, make sure you are in step 1
```shell
git checkout 95eb682303ac78d2caea3efa5cbfcf7acdca903a
```

This is a functioning skeleton for a web app with a chatbot. You can run it as follows
```shell
mvn quarkus:dev
```
or if you installed Quarkus CLI
```shell
quarkus dev
```

This will bring up the page at `localhost:8080`
The chatbot is calling GPT-3.5 (OpenAI) via the backend. You can test it out and observe that it has memory.
This is how memory is built up for LLMs

<img src='src/main/resources/images/chatmemory.png' alt='Chat Memory Concept' width = '450'>

In the console, you can observe the calls that are made to OpenAI behind the scenes, notice the roles 'user' (`UserMessage`) and 'assistant' (`AiMessage`).

If you run into an error about the mvnw maven wrapper, you can give execution permission for the file by navigating to the project folder and executing
```shell
chmod +x mvnw
```

## STEP 2
Play around with the model parameters in 'resources/application.properties'
If you don’t have autocompletion, you can search through them in the Quarkus DevUI at `localhost:8080/q/dev` under `Configuration`.

The precise meaning of most model parameters is described on the website of OpenAI: https://platform.openai.com/docs/api-reference/chat/create

## STEP 3
Instead of passing the response as one block of text when it is ready, enable streaming mode. This will allow us to display the reply token per token, while they come in.
Sorry for what it looks like in the current frontend - do revert it back before moving to step 4 ;)

## STEP 4
Add a `SystemMessage` so the model knows it is a car rental customer assistant.
Observe that the tool is now happy to help with bookings, but does make rules up when it comes to cancellation period.

## STEP 5
Add a RAG system that allows the chatbot to use relevant parts of our Terms of Use (you can find them [here](https://github.com/LizeRaes/quarkus-langchain4j-uphill-workshop/blob/main/src/main/resources/data/miles-of-smiles-terms-of-use.txt)) for answering the customers.

1. Ingestion phase: the documents (files, websites, ...) are loaded, splitted, turned into meaning vectors (embeddings) and stored in an embedding store

<img src='src/main/resources/images/ingestion.png' alt='Ingestion' width = '400'>

2. Retrieval phase: with every user prompt, the relevant fragments of our documents are collected by comparing the meaning vector of the prompt with the vectors in the embedding store. The relevant segments are then passed along to the model together with the original question.

<img src='src/main/resources/images/retrieval.png' alt='Retrieval' width = '400'>

More info on easy RAG in Quarkus can be found [here](https://docs.quarkiverse.io/quarkus-langchain4j/dev/easy-rag.html).

This is already much better, but it still cannot really perform any booking or cancellation.

## STEP 6
Let’s give the model two (dummy) tools to do so:
```java
public Booking getBookingDetails(String customerFirstName, String customerSurname, String bookingNumber) throws BookingNotFoundException
public void cancelBooking(String customerFirstName, String customerSurname, String bookingNumber) throws BookingNotFoundException, BookingCannotBeCancelledException
```
And observe how the chatbot behaves now.
You can ensure that the methods are called by either logging to console, or by putting a breakpoint.

## STEP 7
Let’s make RAG better: add a RetrievalAugmentor with a QueryCompressor and a Reranker (using your Cohere key)
More details on advanced RAG can be found [here](https://github.com/langchain4j/langchain4j/pull/538).
