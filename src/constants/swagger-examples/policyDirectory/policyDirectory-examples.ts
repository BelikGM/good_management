export const findAllPolicyDirectoriesExample = [
  {
    id: '4607b481-7933-4fb6-b707-e15d8881093b',
    directoryName: 'максик плюс плюс',
    createdAt: '2024-12-20T12:47:29.014Z',
    updatedAt: '2024-12-20T12:47:29.014Z',
    policyToPolicyDirectories: [
      {
        id: 'a4f5eb5e-e01e-42c1-b468-b70c6736c650',
        createdAt: '2024-12-20T12:47:29.248Z',
        updatedAt: '2024-12-20T12:47:29.248Z',
        policy: {
          id: '6cf3e08d-8baf-4870-a0ea-18f368e97872',
          policyName: 'Привет',
          policyNumber: 152,
          state: 'Активный',
          type: 'Директива',
          dateActive: '2024-12-20T11:14:27.156Z',
          content:
            '**Привет**![фыв](http://localhost:5000/uploads/1734018563193-Yanukovich.jpg "фыв")',
          createdAt: '2024-12-12T13:30:48.085Z',
          updatedAt: '2024-12-20T11:14:27.436Z',
        },
      },
    ],
  },
];

export const findOnePolicyDirectoryExample = {
  policyDirectory: {
    id: '4607b481-7933-4fb6-b707-e15d8881093b',
    directoryName: 'максик плюс плюс',
    createdAt: '2024-12-20T12:47:29.014Z',
    updatedAt: '2024-12-20T12:47:29.014Z',
    policyToPolicyDirectories: [
      {
        id: 'a4f5eb5e-e01e-42c1-b468-b70c6736c650',
        createdAt: '2024-12-20T12:47:29.248Z',
        updatedAt: '2024-12-20T12:47:29.248Z',
        policy: {
          id: '6cf3e08d-8baf-4870-a0ea-18f368e97872',
          policyName: 'Привет',
          policyNumber: 152,
          state: 'Активный',
          type: 'Директива',
          dateActive: '2024-12-20T11:14:27.156Z',
          content:
            '**Привет**![фыв](http://localhost:5000/uploads/1734018563193-Yanukovich.jpg "фыв")',
          createdAt: '2024-12-12T13:30:48.085Z',
          updatedAt: '2024-12-20T11:14:27.436Z',
        },
      },
    ],
  },
  instructions: [],
  directives: [
    {
      id: '6cf3e08d-8baf-4870-a0ea-18f368e97872',
      policyName: 'Привет',
      policyNumber: 152,
      state: 'Активный',
      type: 'Директива',
      dateActive: '2024-12-20T11:14:27.156Z',
      content:
        '**Привет**![фыв](http://localhost:5000/uploads/1734018563193-Yanukovich.jpg "фыв")',
      createdAt: '2024-12-12T13:30:48.085Z',
      updatedAt: '2024-12-20T11:14:27.436Z',
    },
  ],
};
