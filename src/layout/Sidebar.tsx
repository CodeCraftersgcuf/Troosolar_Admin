import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import LinkComp from "./components/Link";
import { Sidebar_links } from "../constants/siderbar";
import images from "../constants/images";

interface SidebarProps {
    setMobileOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const Sidebar: React.FC<SidebarProps> = ({ setMobileOpen }) => {
    const location = useLocation();
    const [activeLink, setActiveLink] = useState<string>("/dashboard");
    const [menuOpen, setMenuOpen] = useState<boolean>(false);

    useEffect(() => {
        setActiveLink(location.pathname);
    }, [location.pathname]);

    return (
        <div
            className={`h-screen pb-10 overflow-auto transition-all duration-300 ${menuOpen ? "w-[80px]" : "w-[300px]"} bg-[#273E8E] text-white`}
            style={{
                // Adjusting scrollbar styling
                scrollbarWidth: "thin",
                scrollbarColor: "white #273E8E",
            }}
        >
            {/* Mobile Close Button */}
            <div className="flex justify-end lg:hidden p-4">
                <button
                    className="text-xl cursor-pointer"
                    onClick={() => setMobileOpen(false)}
                >
                    ✕
                </button>
            </div>

            {/* Sidebar Header */}
            <div className="flex items-center justify-between px-4">
                <Link to="/dashboard">
                    <img src={images.logo} alt="logo" className="w-50 h-auto" />
                </Link>

                {/* Toggle Menu Icon */}
                {menuOpen && (
                    <div
                        onClick={() => setMenuOpen(false)}
                        className="absolute top-4 left-4 bg-gray-800 p-2 rounded-md"
                    >
                        <i className="bi bi-arrow-left-short text-2xl"></i>
                    </div>
                )}
            </div>

            {/* Menu Items */}
            <nav className="">
                <h1 className="p-4 text-[16px]" >General</h1>
                <ul className="space-y-2">
                    {Sidebar_links.map((x, index) => (
                        <li key={index}>
                            <LinkComp
                                name={x.name}
                                link={x.link}
                                icon={x.icon}
                                sub={x.sublinks}
                                isActiveCheck={activeLink === x.link}
                                onClick={() => setActiveLink(x.link)}
                                menuStatus={menuOpen}
                            />
                        </li>
                    ))}
                </ul>
            </nav>

            {/* Logout Button */}
            <div className=" pt-4 border-t-2 border-[#ffffff79] mx-4 mt-4 flex items-center justify-center">
                <button className="flex items-center p-2 py-4 cursor-pointer gap-2 text-white font-bold rounded-lg w-full hover:border hover:border-white ">
                    <img src={images.logout} alt="logout" className="w-6 h-6" />
                    {!menuOpen && <span>Logout</span>}
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
