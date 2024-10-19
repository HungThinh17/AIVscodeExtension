import { EventEmitter } from 'events';

export async function callOllamaModel(promptText: string, emitter: EventEmitter): Promise<void> {
    const apiEndpoint = "http://localhost:11434/api/generate"; // Ollama API URL
    const model = "qwen2.5-coder"; // Model name

    const requestBody = {
        model,
        prompt: promptText
    };

    try {
        const response = await fetch(apiEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorDetails = await response.text();
            throw new Error(`API request failed with status ${response.status}: ${errorDetails}`);
        }

        // Check if the response is readable stream
        if (response.body) {
            const reader = response.body.getReader();
            const decoder = new TextDecoder("utf-8");

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                const lines = chunk.split('\n');

                for (const line of lines) {
                    if (line.trim()) {
                        try {
                            const data = JSON.parse(line);
                            emitter.emit('data', data.response); // Emit the response for UI update
                            if (data.done) {
                                reader.cancel(); // Stop reading when done is true
                                break;
                            }
                        } catch (error) {
                            console.error("__vietcode JSON parse error: ", error);
                        }
                    }
                }
            }

            emitter.emit('end'); // Emit an end event once done
        } else {
            throw new Error("Response body is not readable");
        }
    } catch (error: any) {
        console.error("__vietcode Error: " + error.message);
        emitter.emit('error', error.message); // Emit error for UI error handling
    }
}