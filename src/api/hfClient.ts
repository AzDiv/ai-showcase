import { HfInference } from '@huggingface/inference';

const HF_TOKEN = import.meta.env.VITE_HF_TOKEN || '';

export interface HFModel {
  id: string;
  name: string;
  category: 'text' | 'image' | 'audio' | 'chat';
  description: string;
  inputType: 'text' | 'file';
  provider?: string;
}

export const models: HFModel[] = [
  {
    id: 'HuggingFaceTB/SmolLM3-3B',
    name: 'SmolLM3-3B',
    category: 'text',
    description: 'Compact 3B parameter language model for text generation',
    inputType: 'text',
    provider: 'hf-inference'
  },
  {
    id: 'deepseek-ai/DeepSeek-R1-0528',
    name: 'DeepSeek-R1',
    category: 'chat',
    description: 'Advanced reasoning model powered by Fireworks AI',
    inputType: 'text',
    provider: 'fireworks-ai'
  },
  {
    id: 'black-forest-labs/flux-dev',
    name: 'FLUX.1 Dev',
    category: 'image',
    description: 'Advanced image generation model',
    inputType: 'text',
    provider: 'router'
  },
  {
    id: 'google/vit-base-patch16-224',
    name: 'Vision Transformer',
    category: 'image',
    description: 'Image classification using Vision Transformers',
    inputType: 'file'
  },
  {
    id: 'facebook/detr-resnet-50',
    name: 'DETR Object Detection',
    category: 'image',
    description: 'Object detection and localization in images',
    inputType: 'file'
  },
  {
    id: 'openai/whisper-tiny',
    name: 'Whisper Tiny',
    category: 'audio',
    description: 'Lightweight speech recognition model',
    inputType: 'file'
  },
  {
  }
];

export class HFClient {
  private client: HfInference;
  private apiToken: string;

  constructor(token?: string) {
    this.apiToken = token || HF_TOKEN;
    if (!this.apiToken) {
      throw new Error('Hugging Face API token is required. Please set VITE_HF_TOKEN in your .env file.');
    }
    this.client = new HfInference(this.apiToken);
  }

  async queryText(modelId: string, inputs: string): Promise<any> {
    try {
      const model = models.find(m => m.id === modelId);
      
      // Handle SmolLM3-3B using hf-inference provider
      if (model?.provider === 'hf-inference' && model.category === 'text') {
        const response = await this.client.chatCompletion({
          provider: "hf-inference",
          model: modelId,
          messages: [
            {
              role: "user",
              content: inputs,
            },
          ],
          max_tokens: 500,
          temperature: 0.7
        });
        
        return [{
          generated_text: response.choices[0].message.content,
          model: modelId,
          type: 'text_generation'
        }];
      }
      
      // Handle chat models using Fireworks AI provider
      if (model?.provider === 'fireworks-ai' && model.category === 'chat') {
        const response = await this.client.chatCompletion({
          provider: "fireworks-ai",
          model: modelId,
          messages: [
            {
              role: "user",
              content: inputs,
            },
          ],
          max_tokens: 500,
          temperature: 0.7
        });
        
        return {
          type: 'chat',
          generated_text: response.choices[0].message.content,
          model: modelId
        };
      }
      
      // Handle image generation models using router API
      if (model?.provider === 'router' && model.category === 'image') {
        return await this.generateImage(modelId, inputs);
      }
      
      // Use text generation for all text models
      const response = await this.client.textGeneration({
        model: modelId,
        inputs: inputs,
        parameters: {
          max_new_tokens: 100,
          temperature: 0.7,
          return_full_text: false,
        },
      });
      
      return [{
        generated_text: response.generated_text,
        model: modelId,
        type: 'text_generation'
      }];
    } catch (error: any) {
      console.error('Text query error:', error);
      throw this.handleError(error);
    }
  }

  async queryFile(modelId: string, file: File): Promise<any> {
    try {
      const model = models.find(m => m.id === modelId);
      
      // Handle Whisper large-v3 using router API
      if (modelId === 'openai/whisper-large-v3') {
        return await this.processWhisperLargeV3(file);
      }
      
      if (model?.category === 'image') {
        if (modelId.includes('detr')) {
          // Object detection
          const response = await this.client.objectDetection({
            model: modelId,
            data: file,
          });
          return response;
        } else {
          // Image classification
          const response = await this.client.imageClassification({
            model: modelId,
            data: file,
          });
          return response;
        }
      } else if (model?.category === 'audio') {
        // Speech recognition
        const response = await this.client.automaticSpeechRecognition({
          model: modelId,
          data: file,
        });
        return response;
      }
      
      throw new Error('Unsupported file type for this model');
    } catch (error: any) {
      console.error('File query error:', error);
      throw this.handleError(error);
    }
  }

  async generateImage(modelId: string, prompt: string): Promise<any> {
    try {
      const response = await fetch(
        "https://router.huggingface.co/nebius/v1/images/generations",
        {
          headers: {
            Authorization: `Bearer ${this.apiToken}`,
            "Content-Type": "application/json",
          },
          method: "POST",
          body: JSON.stringify({
            response_format: "b64_json",
            prompt: prompt,
            model: modelId,
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Image generation failed: ${response.status} ${errorText}`);
      }

      const result = await response.json();
      
      // Convert base64 to blob URL for display
      if (result.data && result.data[0] && result.data[0].b64_json) {
        const base64Data = result.data[0].b64_json;
        const binaryString = atob(base64Data);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        const blob = new Blob([bytes], { type: 'image/png' });
        const imageUrl = URL.createObjectURL(blob);
        
        return {
          type: 'image_generation',
          imageUrl: imageUrl,
          prompt: prompt,
          model: modelId
        };
      }
      
      throw new Error('Invalid response format from image generation API');
    } catch (error: any) {
      console.error('Image generation error:', error);
      throw this.handleError(error);
    }
  }

  async processWhisperLargeV3(file: File): Promise<any> {
    try {
      const response = await fetch(
        "https://router.huggingface.co/hf-inference/models/openai/whisper-large-v3",
        {
          headers: {
            Authorization: `Bearer ${this.apiToken}`,
            "Content-Type": file.type || "audio/flac",
          },
          method: "POST",
          body: file,
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Whisper API failed: ${response.status} ${errorText}`);
      }

      const result = await response.json();
      
      // Return in consistent format
      return {
        text: result.text || result.transcription || 'No transcription available',
        model: 'openai/whisper-large-v3',
        type: 'speech_recognition'
      };
    } catch (error: any) {
      console.error('Whisper large-v3 processing error:', error);
      throw this.handleError(error);
    }
  }

  private handleError(error: any): Error {
    if (error.message) {
      // Handle specific error messages from HF API
      if (error.message.includes('Model not found')) {
        return new Error('Model not found. The model may not exist or is not publicly available.');
      }
      if (error.message.includes('Rate limit')) {
        return new Error('Rate limit exceeded. Please try again later.');
      }
      if (error.message.includes('loading')) {
        return new Error('Model is currently loading. Please try again in a few moments.');
      }
      if (error.message.includes('token')) {
        return new Error('Invalid API token. Please check your Hugging Face token.');
      }
      if (error.message.includes('No Inference Provider')) {
        return new Error('This model requires a specific provider configuration. Please try a different model or check your API access.');
      }
      if (error.message.includes('Invalid username or password')) {
        return new Error('Authentication failed. Please check your Hugging Face API token and ensure it has the necessary permissions.');
      }
      return new Error(`API Error: ${error.message}`);
    }
    
    return new Error('An unexpected error occurred. Please try again.');
  }

  // Method to check if a model is available
  async checkModelStatus(modelId: string): Promise<boolean> {
    try {
      // Try a simple request to check if model is accessible
      await this.client.textGeneration({
        model: modelId,
        inputs: "test",
        parameters: { max_new_tokens: 1 },
      });
      return true;
    } catch {
      return false;
    }
  }
}

export const hfClient = new HFClient();