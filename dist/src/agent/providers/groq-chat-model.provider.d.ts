import { ChatGroq } from '@langchain/groq';
import { Provider } from '@nestjs/common';
export declare function InjectChatModel(): PropertyDecorator & ParameterDecorator;
export declare const GroqChatModelProvider: Provider<ChatGroq>;
