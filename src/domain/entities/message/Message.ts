export type MessageStatus = 'sending' | 'sent' | 'failed' | 'recalled';
export type MessageType = 'text' | 'image' | 'file';
export type MessageSender = 'user' | 'bot';

export class Message {
  public readonly id: number;
  public readonly content: string;
  public readonly sender: MessageSender;
  public readonly timestamp: Date;
  public readonly type: MessageType;
  public status: MessageStatus;
  public updatedAt?: Date;

  constructor(data: {
    id: number;
    content: string;
    sender: MessageSender;
    timestamp: string | Date;
    type: MessageType;
    status: MessageStatus;
    updatedAt?: string | Date;
  }) {
    this.id = data.id;
    this.content = data.content;
    this.sender = data.sender;
    this.timestamp = new Date(data.timestamp);
    this.type = data.type;
    this.status = data.status;
    this.updatedAt = data.updatedAt ? new Date(data.updatedAt) : undefined;
  }

  public isFromUser(): boolean {
    return this.sender === 'user';
  }

  public isFromBot(): boolean {
    return this.sender === 'bot';
  }

  public isSending(): boolean {
    return this.status === 'sending';
  }

  public isSent(): boolean {
    return this.status === 'sent';
  }

  public isFailed(): boolean {
    return this.status === 'failed';
  }

  public isRecalled(): boolean {
    return this.status === 'recalled';
  }

  public canRetry(): boolean {
    return this.isFailed() && this.isFromUser();
  }

  public canDelete(): boolean {
    return this.isFromUser();
  }

  public canRecall(): boolean {
    return this.isFromUser() && this.isSent();
  }

  public isRecent(): boolean {
    const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);
    return this.timestamp > twoMinutesAgo;
  }

  public updateStatus(status: MessageStatus): void {
    this.status = status;
    this.updatedAt = new Date();
  }

  public getFormattedTime(): string {
    return this.timestamp.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }

  public getFormattedDate(): string {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (this.isSameDay(today)) {
      return 'Today';
    } else if (this.isSameDay(yesterday)) {
      return 'Yesterday';
    } else {
      return this.timestamp.toLocaleDateString();
    }
  }

  public isSameDay(date: Date): boolean {
    return (
      this.timestamp.getFullYear() === date.getFullYear() &&
      this.timestamp.getMonth() === date.getMonth() &&
      this.timestamp.getDate() === date.getDate()
    );
  }

  public static create(data: {
    id: number;
    content: string;
    sender: MessageSender;
    timestamp: string | Date;
    type: MessageType;
    status: MessageStatus;
    updatedAt?: string | Date;
  }): Message {
    return new Message(data);
  }
}