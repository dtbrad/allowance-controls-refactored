export default function formatDateString(dateString: string): string {
    const months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December"
    ];

    const [datePart] = dateString.split("T");
    const [year, month, day] = datePart.split("-").map(Number);

    return `${months[month - 1]} ${day}, ${year}`;
}
