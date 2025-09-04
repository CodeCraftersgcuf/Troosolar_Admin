import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

interface SubLink {
  name: string;
  link: string;
  icon: string;
}

interface LinkCompProps {
  name: string;
  link: string;
  sub?: SubLink[];
  isActiveCheck: boolean;
  icon: string;
  onClick: () => void;
  menuStatus: boolean;
}

const LinkComp: React.FC<LinkCompProps> = ({
  name,
  link,
  sub = [],
  isActiveCheck,
  icon,
  onClick,
  menuStatus,
}) => {
  const location = useLocation();
  const [isActive, setIsActive] = useState<boolean>(isActiveCheck);
  if (location.pathname.split('/')[1] == link.split('/')[1]) {
    console.log("true")
  }

  useEffect(() => {
    setIsActive(
      location.pathname.split('/')[1] == link.split('/')[1] ||
      sub.some((item) =>
        location.pathname === item.link ||
        location.pathname.split('/')[1] === link.split('/')[1]
      )
    );
  }, [location.pathname, link, sub]);

  return (
    <div className="relative">
      {/* Purple Side Border for Active Tab */}

      <Link
        to={link}
        onClick={onClick}
        className={`group  flex items-center py-3 rounded-md transition-all duration-200 mx-4 relative group:
          ${isActive ? "bg-white text-[#273E8E]" : "text-gray-400 hover:bg-white hover:text-[#273E8E]"}`}
      >
        <img src={icon} alt={`${name} icon`} className={`w-10 h-10 ${isActive ? 'invert' : 'group-hover:invert'} `} />
        {!menuStatus && <span className="font-medium">{name}</span>}
        <div className={`absolute right-1 top-1/2 h-[40%] bg-[#273E8E] w-1 rounded hidden transform -translate-y-1/2 ${isActive ? 'block' : 'group-hover:block'}`}></div>
      </Link>
    </div>
  );
};

export default LinkComp;
