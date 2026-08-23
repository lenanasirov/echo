const formatRelativeTime = (createdAt) => {
    const now = new Date();
    const date = new Date(createdAt);

    const differenceInSeconds = Math.floor(
        (now - date) / 1000
    );

    if (differenceInSeconds < 60) {
        return "just now";
    }

    const differenceInMinutes = Math.floor(
        differenceInSeconds / 60
    );

    if (differenceInMinutes < 60) {
        return `${differenceInMinutes}m ago`;
    }

    const differenceInHours = Math.floor(
        differenceInMinutes / 60
    );

    if (differenceInHours < 24) {
        return `${differenceInHours}h ago`;
    }

    const differenceInDays = Math.floor(
        differenceInHours / 24
    );

    if (differenceInDays < 7) {
        return `${differenceInDays}d ago`;
    }

    const differenceInWeeks = Math.floor(
        differenceInDays / 7
    );

    if (differenceInWeeks < 4) {
        return `${differenceInWeeks}w ago`;
    }

    return date.toLocaleDateString();
};

export default formatRelativeTime;