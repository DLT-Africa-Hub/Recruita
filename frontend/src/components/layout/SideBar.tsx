import React from "react";
import { NavLink } from "react-router-dom";
import { BsSearch } from "react-icons/bs";
import { LuBriefcase } from "react-icons/lu";
import { RiHomeSmile2Line } from "react-icons/ri";
import { IconType } from "react-icons";
import { BiBell, BiChevronDown } from "react-icons/bi";
import { HiOutlineChatBubbleLeftRight } from "react-icons/hi2";
import { PiUsersThreeLight } from "react-icons/pi";

interface Page {
  page: string;
  link: string; // path without leading slash or with — we'll normalize
  icon: IconType;
}

const user = {
  name: "Ibrahim Aliyu",
  role: "company", // <-- change to "company" to see company menu
  username: "DrUiDdE",
  photo:
    "https://res.cloudinary.com/dispu86tu/image/upload/v1754609041/Confident_Gaze_Against_Blue_Backdrop_r57ue0.png",
};

const pagesByRole: Record<string, Page[]> = {
  company: [
    { page: "Dashboard", link: "company", icon: RiHomeSmile2Line },
    { page: "Candidates", link: "candidates", icon: PiUsersThreeLight },
    { page: "Messages", link: "messages", icon: HiOutlineChatBubbleLeftRight },
    { page: "Jobs", link: "jobs", icon: LuBriefcase },
    { page: "Explore", link: "explore", icon: BsSearch },
    { page: "Notification", link: "notifications", icon: BiBell },
  ],
  graduate: [
    { page: "Dashboard", link: "graduate", icon: RiHomeSmile2Line },
    { page: "Messages", link: "messages", icon: HiOutlineChatBubbleLeftRight },
    { page: "Explore", link: "explore", icon: BsSearch },
    { page: "Applications", link: "applications", icon: LuBriefcase },
    { page: "Notification", link: "notifications", icon: BiBell },
  ],
};

const SideBar: React.FC = () => {
  const role = user.role ?? "graduate";
  const pages = pagesByRole[role] ?? pagesByRole["graduate"];

  const normalizePath = (p: string) => (p.startsWith("/") ? p : `/${p}`);

  return (
    <div className="pt-[20px] max-w-[283px]">
      <div className="bg-[#F8F8F8] flex flex-col justify-between w-full gap-[40px] items-center py-[45px] px-[30px] rounded-r-[20px] border border-[#1B770033] min-h-[80vh]">
        <div className="flex flex-col items-center gap-[40px]">
          {pages.map((page) => {
            const to = normalizePath(page.link);

            return (
              <NavLink
                key={page.link}
                to={to}
                className={({ isActive }) =>
                  `flex items-center text-[24px] gap-[10px] px-[10px] py-[20px] w-[218px] rounded-[20px] ${
                    isActive ? "bg-[#DBFFC0] text-[#1C1C1C]" : "text-[#1C1C1C80]"
                  }`
                }
              >
                <page.icon />
                <p>{page.page}</p>
              </NavLink>
            );
          })}
        </div>

        <div className="bg-[#F0F0F0] p-2.5 flex items-center justify-center gap-[8px] rounded-[10px] w-full">
          <img
            src={user.photo ?? "/profile.png"}
            alt={user.name}
            className="w-[50px] h-[50px] rounded-[10px] object-cover"
          />
          <div className="flex-1 text-left">
            <p className="text-[#1C1C1C] font-semibold text-[18px]">
              {user.name}
            </p>
            <p className="text-[#1C1C1C80] font-normal text-[14px]">
              @{user.username || user.name?.split(" ")[0].toLowerCase() || "user"}
            </p>
          </div>

          <BiChevronDown />
        </div>
      </div>
    </div>
  );
};

export default SideBar;
