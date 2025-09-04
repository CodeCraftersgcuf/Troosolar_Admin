import React from 'react';
import images from '../../constants/images';


interface ProfileProps {
  name?: string;
  img?: string;
}

const Profile: React.FC<ProfileProps> = ({ name = 'Admin'}) => {

  return (
    <div className="relative flex items-center gap-5">
      <button className='p-2 shadow border border-gray-200 rounded-md'>
        <img src={images.notifcation} alt="notification" className='size-5' />
      </button>
      <div
        className="flex items-center gap-4 cursor-pointer"
        onClick={()=> {}}
      >
        <img src={images.admin}  className="w-14 h-14 rounded-full bg-gray-200" />
        <div>
          <h2 className="text-xl capitalize"> Hi, {name}</h2>
        </div>
      </div>
    </div>
  );
};

export default Profile;
