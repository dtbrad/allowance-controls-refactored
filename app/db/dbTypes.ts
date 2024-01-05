export {Role} from "@prisma/client";

export {DayofWeek} from "@prisma/client";

export interface Transaction {
    id: string;
    userId: string;
    amount: number;
    transactionDate: string;
    createdOn: string;
    editedLast: string;
    description: string;
}
