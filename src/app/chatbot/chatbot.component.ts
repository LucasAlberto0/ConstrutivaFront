import { Component, OnInit, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '@shared/auth.service';
import { UserInfo } from '@shared/models/user.model';
import { environment } from '../../environments/environment';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http'; // Import HttpHeaders

interface Message {
  text: string;
  timestamp: Date;
  isUser: boolean;
}

interface DaiApiResponse {
  id: string;
  messageServiceId: string;
  message: string;
  response: string; // Updated to 'response'
}

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  providers: [AuthService],
  templateUrl: './chatbot.component.html',
  styleUrl: './chatbot.component.scss'
})
export class ChatbotComponent implements OnInit, AfterViewChecked {
  @ViewChild('chatMessages') private chatMessagesContainer!: ElementRef;

  messages: Message[] = [];
  newMessage: string = '';
  userProfilePicUrl: string | undefined;
  isLoading: boolean = false;
  private userId: string | undefined;
  private username: string | undefined; // To store the logged-in user's name
  private readonly DAI_API_KEY = 'qy0WXuJeO2YpOqu4oxUkpXmppP2dR52MkadTg9GqFvfh0iyNxrsyS98sPssUt2Dy';
  private readonly DAI_API_ENDPOINT = 'https://api.dai.tec.br/v1/chats'; // Updated endpoint
  private readonly LOCAL_STORAGE_KEY = 'chatbot_messages';

  constructor(
    private authService: AuthService,
    private http: HttpClient
  ) { }

  ngOnInit(): void {
    this.loadMessages(); // Load messages from localStorage

    if (this.messages.length === 0) {
      this.messages.push({
        text: 'Olá! Como posso ajudar você hoje?',
        timestamp: new Date(),
        isUser: false
      });
    }

    this.authService.getMe().subscribe({
      next: (userInfo: UserInfo) => {
        this.userId = userInfo.id;
        this.username = userInfo.nomeCompleto; // Store the username
        if (userInfo.profilePictureUrl) {
          this.userProfilePicUrl = this._getProfilePictureFullUrl(userInfo.profilePictureUrl);
        } else {
          this.userProfilePicUrl = 'public/img/userIcon.svg';
        }
      },
      error: (err: any) => {
        console.error('Failed to fetch user info for profile picture:', err);
        this.userProfilePicUrl = 'public/img/userIcon.svg';
      }
    });
  }

  private _getProfilePictureFullUrl(relativeUrl: string | undefined): string | undefined {
    if (!relativeUrl) {
      return undefined;
    }
    const baseUrl = environment.apiUrl.endsWith('/') ? environment.apiUrl.slice(0, -1) : environment.apiUrl;
    const cleanRelativeUrl = relativeUrl.startsWith('/') ? relativeUrl : `/${relativeUrl}`;
    return `${baseUrl}${cleanRelativeUrl}`;
  }

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  sendMessage(): void {
    if (this.newMessage.trim()) {
      const userMessage = this.newMessage;
      this.messages.push({
        text: userMessage,
        timestamp: new Date(),
        isUser: true
      });
      this.saveMessages(); // Save messages after user sends one
      this.newMessage = '';
      this.isLoading = true;
      this.sendToDaiAssistant(userMessage);
    }
  }

  sendToDaiAssistant(message: string): void {
    if (!this.userId) {
      console.error('User ID not available. Cannot send message to Dai Assistant.');
      this.messages.push({
        text: 'Erro: ID do usuário não disponível. Por favor, tente novamente mais tarde.',
        timestamp: new Date(),
        isUser: false
      });
      this.isLoading = false;
      this.saveMessages(); // Save messages after error
      return;
    }

    const headers = new HttpHeaders({
      'x-api-key': this.DAI_API_KEY,
      'Content-Type': 'application/json'
    });

    const payload = {
      messageServiceId: this.userId,
      username: this.username || 'Usuário',
      message: message
    };

    this.http.post<DaiApiResponse>(this.DAI_API_ENDPOINT, payload, { headers }).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.messages.push({
          text: response.response,
          timestamp: new Date(),
          isUser: false
        });
        this.saveMessages(); // Save messages after assistant responds
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Error calling Dai Assistant API:', err);
        this.messages.push({
          text: 'Desculpe, não consegui me conectar com a assistente no momento. Por favor, tente novamente.',
          timestamp: new Date(),
          isUser: false
        });
        this.saveMessages(); // Save messages after error
      }
    });
  }

  scrollToBottom(): void {
    try {
      this.chatMessagesContainer.nativeElement.scrollTop = this.chatMessagesContainer.nativeElement.scrollHeight;
    } catch (err) { }
  }

  private saveMessages(): void {
    localStorage.setItem(this.LOCAL_STORAGE_KEY, JSON.stringify(this.messages));
  }

  private loadMessages(): void {
    const storedMessages = localStorage.getItem(this.LOCAL_STORAGE_KEY);
    if (storedMessages) {
      this.messages = JSON.parse(storedMessages).map((msg: Message) => ({
        ...msg,
        timestamp: new Date(msg.timestamp) // Convert timestamp string back to Date object
      }));
    }
  }

  clearHistory(): void {
    this.messages = [{
      text: 'Olá! Como posso ajudar você hoje?',
      timestamp: new Date(),
      isUser: false
    }];
    localStorage.removeItem(this.LOCAL_STORAGE_KEY);
  }
}

