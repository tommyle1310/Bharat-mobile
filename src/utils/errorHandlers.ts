export const errorHandlers = (error: string) => {
    console.log('error', error);
    switch (error) {
        case 'Bid difference must be at least 1000':
            return 'Bid difference must be at least 1000';
        case 'You bid too high!':
            return 'You bid too high!';
        case 'Bid must be higher than previous bid':
            return 'Bid must be higher than previous bid';
        case "You don't have access to place bid on this vehicle":
            return "You don't have access to place bid on this vehicle";
        case "Max bid amount exceeds your pending limit":
            return "Max bid amount exceeds your pending limit";
        case 'You cannot place a bid on this vehicle':
            return 'You cannot place a bid on this vehicle';
        default:
            return error;
    }
}