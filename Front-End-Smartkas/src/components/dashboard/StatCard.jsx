const StatCard = ({ title, value, subtitle, icon: Icon, iconBg, iconColor, trend, trendUp }) => {
  return (
    <div className="bg-white rounded-2xl shadow-md p-5 flex items-center justify-between hover:shadow-lg transition-shadow duration-300 animate-fade-in">
      <div className="flex-1">
        <p className="text-sm text-slate-500 font-medium">{title}</p>
        <h3 className="text-2xl font-bold text-slate-800 mt-1">{value}</h3>
        {subtitle && (
          <p className={`text-xs mt-1.5 font-medium ${trendUp ? 'text-emerald-500' : trend ? 'text-red-500' : 'text-slate-400'}`}>
            {trend && (
              <span className="mr-1">{trendUp ? '▲' : '▼'}</span>
            )}
            {subtitle}
          </p>
        )}
      </div>
      <div
        className={`w-12 h-12 rounded-2xl flex items-center justify-center ${iconBg || 'bg-orange-100'}`}
      >
        <Icon size={22} className={iconColor || 'text-orange-500'} />
      </div>
    </div>
  );
};

export default StatCard;
