export class MessageStatus {
  public static readonly SENDING = 'sending' as const;
  public static readonly SENT = 'sent' as const;
  public static readonly FAILED = 'failed' as const;

  public static getAll(): readonly string[] {
    return [this.SENDING, this.SENT, this.FAILED];
  }

  public static isValid(status: string): status is 'sending' | 'sent' | 'failed' {
    return this.getAll().includes(status);
  }

  public static getDisplayName(status: 'sending' | 'sent' | 'failed'): string {
    switch (status) {
      case this.SENDING:
        return 'Sending...';
      case this.SENT:
        return 'Sent';
      case this.FAILED:
        return 'Failed';
      default:
        return 'Unknown';
    }
  }

  public static getColor(status: 'sending' | 'sent' | 'failed'): string {
    switch (status) {
      case this.SENDING:
        return '#fbbf24'; // amber-500
      case this.SENT:
        return '#10b981'; // emerald-500
      case this.FAILED:
        return '#ef4444'; // red-500
      default:
        return '#6b7280'; // gray-500
    }
  }
}