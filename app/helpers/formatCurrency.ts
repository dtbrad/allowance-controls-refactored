export default function formatCurrency(integerCents: number) {
    return (integerCents / 100).toLocaleString("en-US", {
        style: "currency",
        currency: "USD"
    });
}
