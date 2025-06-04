// components/StakeList.tsx

import StakeRow from './StakeRow';

const dummyUsers = [
  { wallet: '0xaaa...111', stakeStartDate: '2025-05-30T10:00:00Z', unstaked: false },
  { wallet: '0xbbb...222', stakeStartDate: '2025-05-20T10:00:00Z', unstaked: false },
  { wallet: '0xccc...333', stakeStartDate: '2025-04-15T10:00:00Z', unstaked: false },
  { wallet: '0xddd...444', stakeStartDate: '2025-03-20T10:00:00Z', unstaked: false },
  { wallet: '0xeee...555', stakeStartDate: '2025-05-20T10:00:00Z', unstaked: true },
];

const StakeList = () => (
  <div className="space-y-2">
    {dummyUsers.map((user, i) => (
      <StakeRow key={i} user={user} />
    ))}
  </div>
);

export default StakeList;
