export interface Admin {
  id: string;
  firstName: string;
  surname: string;
  email: string;
  bvn: string;
  password: string;
  image: string;
  role: string;
  dateJoined: string;
  activity: Activity[];
}

export interface Activity {
  id: string;
  description: string;
  date: string;
}

export const adminData: Admin = {
  id: '1',
  firstName: 'Faizah',
  surname: 'Adewale',
  email: 'Adewalefaizah@gmail.com',
  bvn: '0234682284',
  password: '**********',
  image: '/assets/layout/profile.png',
  role: 'Admin',
  dateJoined: '05-07-25/07:22AM',
  activity: [
    {
      id: '1',
      description: 'User Created account',
      date: '05-07-25/07:22AM'
    },
    {
      id: '2',
      description: 'User Created account',
      date: '05-07-25/07:22AM'
    },
    {
      id: '3',
      description: 'User Created account',
      date: '05-07-25/07:22AM'
    }
  ]
};

export const allAdminsData: Admin[] = [
  {
    id: '1',
    firstName: 'Adam',
    surname: 'Anta',
    email: 'abcdefr@gmail.com',
    bvn: '544856665',
    password: '**********',
    image: '/assets/layout/profile.png',
    role: 'Admin',
    dateJoined: '05-07-25/07:22AM',
    activity: [
      {
        id: '1',
        description: 'User Created account',
        date: '05-07-25/07:22AM'
      },
      {
        id: '2',
        description: 'User Created account',
        date: '05-07-25/07:22AM'
      },
      {
        id: '3',
        description: 'User Created account',
        date: '05-07-25/07:22AM'
      }
    ]
  },
  {
    id: '2',
    firstName: 'Adam',
    surname: 'Anta',
    email: 'abcdefr@gmail.com',
    bvn: '544856665',
    password: '**********',
    image: '/assets/layout/profile.png',
    role: 'Admin',
    dateJoined: '05-07-25/07:22AM',
    activity: [
      {
        id: '1',
        description: 'User Created account',
        date: '05-07-25/07:22AM'
      },
      {
        id: '2',
        description: 'User Created account',
        date: '05-07-25/07:22AM'
      }
    ]
  },
  {
    id: '3',
    firstName: 'Adam',
    surname: 'Anta',
    email: 'abcdefr@gmail.com',
    bvn: '544856665',
    password: '**********',
    image: '/assets/layout/profile.png',
    role: 'Admin',
    dateJoined: '05-07-25/07:22AM',
    activity: [
      {
        id: '1',
        description: 'User Created account',
        date: '05-07-25/07:22AM'
      },
      {
        id: '2',
        description: 'User Created account',
        date: '05-07-25/07:22AM'
      },
      {
        id: '3',
        description: 'User Created account',
        date: '05-07-25/07:22AM'
      }
    ]
  }
];
