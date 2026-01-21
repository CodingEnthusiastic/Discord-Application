import { format, isToday, isYesterday } from 'date-fns';

export const formatDiscordTime = (timestamp) => {
    if (!timestamp) return "";

    const date = new Date(timestamp);

    // 1. If it's today: "Today at 12:30 PM"
    if (isToday(date)) {
        return `Today at ${format(date, 'h:mm a')}`;
    }

    // 2. If it's yesterday: "Yesterday at 12:30 PM"
    if (isYesterday(date)) {
        return `Yesterday at ${format(date, 'h:mm a')}`;
    }

    // 3. Otherwise: "01/04/2026" (or however you prefer)
    return format(date, 'MM/dd/yyyy');
};
