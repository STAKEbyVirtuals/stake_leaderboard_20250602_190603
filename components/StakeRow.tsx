import { getStakeTier } from '../utils/tier';
import { TierStyleMap } from '../utils/tierStyles';

interface UserData {
  wallet: string;
  stakeStartDate: string;
  unstaked: boolean;
}

const StakeRow = ({ user }: { user: UserData }) => {
  const tier = getStakeTier(user.stakeStartDate, user.unstaked);
  const style = TierStyleMap[tier];

  return (
    <div className={`p-2 rounded-xl shadow-sm ${style.bgColor} ${style.effectClass}`}>
      <div className={`text-lg flex items-center gap-2 ${style.textColor}`}>
        <img src={style.image} alt={tier} className="w-6 h-6" />
        {user.wallet.slice(0, 6)}... — <span className="font-mono">{tier}</span>
      </div>
    </div>
  );
};

export default StakeRow;
