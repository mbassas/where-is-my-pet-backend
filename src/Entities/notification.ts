export interface NotificationInput {
    message: string;
    link: string;
    read: boolean;
    user_id: number;
};

export interface Notification extends NotificationInput {
    id: number;
    publication_date: string;
};