export interface ReferralData {
  id: string;
  name: string;
  noOfReferral: number;
  amountEarned: string;
  dateJoined: string;
}

export const referralData: ReferralData[] = [
  {
    id: "1",
    name: "Adewale Faizah",
    noOfReferral: 100,
    amountEarned: "N1,100,000",
    dateJoined: "05-07-25/07:22AM"
  },
  {
    id: "2",
    name: "John Adam",
    noOfReferral: 100,
    amountEarned: "N1,100,000",
    dateJoined: "05-07-25/07:22AM"
  },
  {
    id: "3",
    name: "Chris Banner",
    noOfReferral: 100,
    amountEarned: "N1,100,000",
    dateJoined: "05-07-25/07:22AM"
  },
  {
    id: "4",
    name: "Adam Waa",
    noOfReferral: 100,
    amountEarned: "N1,100,000",
    dateJoined: "05-07-25/07:22AM"
  },
  {
    id: "5",
    name: "Anita Shawn",
    noOfReferral: 100,
    amountEarned: "N1,100,000",
    dateJoined: "05-07-25/07:22AM"
  },
  {
    id: "6",
    name: "Cole Palmer",
    noOfReferral: 100,
    amountEarned: "N1,100,000",
    dateJoined: "05-07-25/07:22AM"
  }
];

export const sortOptions = [
  { value: "default", label: "Sort By" },
  { value: "name", label: "Name" },
  { value: "referrals", label: "Referrals" },
  { value: "amount", label: "Amount" },
  { value: "date", label: "Date" }
];
