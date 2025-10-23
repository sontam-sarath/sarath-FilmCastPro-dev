import React, { useEffect, useState } from "react";
import "./UserProfile.css";
import { supabase } from "../lib/supabaseClient";
import { useNavigate } from "react-router-dom";
import { ProfileData,checkSession,getSignedUrl} from "../data/pricing";

export const UserProfile: React.FC = () => {

  const navigate = useNavigate();
  const [ProfileData, setProfileData] = useState<ProfileData>({
    name: "",
    role: "",
    location: "",
    bio: "",
    headline: "",
    coverPhoto: "",
    profilePhoto: "",
    experience: [],
    skills: [],
    education: [],
    plan: "",
    email:"",
    gender:"",
    phone:"",
    dob:"",
    socialLink: "",
    instagram:""
  });



const fetchData = async () => {
  const loginId = await checkSession();
  const userId = loginId?.[0];

  if (!userId) {
    console.log("No active session");
    return;
  }

  console.log("Logged in user ID:", userId);

  const { data, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", userId)
    .single();
    let finalProfileData = data;
  if (profileError) {
        const { data, error } = await supabase.from("profiles").upsert(
        {
            user_id: userId,
            name: loginId?.[1],
        },
        { onConflict: "user_id" })
        .select()
        .single();
        if (error) {
          console.error("Upsert error:", error.message);
          return;
        }
        finalProfileData = data;
        console.log("Final Profile Data:", data);
    }
      const profilePhotoUrl = finalProfileData.profilePhoto
        ? await getSignedUrl("profile-photos", finalProfileData.profilePhoto)?? "" : "";
      const coverPhotoUrl = finalProfileData.coverPhoto
      ? await getSignedUrl("cover-photos", finalProfileData.coverPhoto)?? "" : "";
      const completeProfileData = {
    ...finalProfileData,
    profilePhoto: profilePhotoUrl,
    coverPhoto: coverPhotoUrl,
};


    console.log("Final Profile Data (Fetched):", data);

    setProfileData(completeProfileData);
  
  }




  useEffect(() => {
    fetchData();
  }, []);


return (
    <>
      <div className="bg-gray-900 min-h-screen p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-5xl mx-auto">
          
          {/* ======================= Header Section ======================= */}
          <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg">
            <img
              src={ProfileData.coverPhoto || "https://wallpapers.com/images/hd/minimalist-simple-linkedin-background-inmeafna599ltxxm.jpg"}
              alt="Cover"
              className="w-full h-48 object-cover"
            />
            <div className="p-6 relative">
              <div className="absolute left-6 md:left-10 -top-16">
                <div className="w-32 h-32 rounded-full border-4 border-gray-900 shadow-2xl overflow-hidden bg-gray-700 flex items-center justify-center">
                  <img
                    src={ProfileData.profilePhoto || "https://placehold.co/128x128/374151/ffffff?text=No+Photo"} 
                    alt={`${ProfileData.name || "User"}'s Profile`}
                    className="w-full h-full object-cover object-center"
                  />
                </div>
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between">
                <div className="mt-16 sm:mt-0 sm:ml-40 flex-grow">
                  <h1 className="text-3xl font-bold text-white">{ProfileData.name || ""}</h1>
                  <p className="text-yellow-400 text-lg">{ProfileData.role || ""}</p>
                  <p className="text-gray-400 text-sm">{ProfileData.location || ""}</p>
                </div>
                <div className="mt-4 sm:mt-0 flex items-center gap-4 text-sm whitespace-nowrap">
                  <div className="text-center">
                    <p className="font-bold text-white">0</p>
                    <p className="text-gray-400">Connections</p>
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-white">0</p>
                    <p className="text-gray-400">Projects</p>
                  </div>
                <button className="bg-yellow-500 text-black px-4 py-2 rounded-lg shadow hover:bg-yellow-400 transition duration-300 font-medium" onClick={
                  () => { 

                    navigate('ProfileEdit', {
                      state: {initialProfileData: ProfileData}
                    }); 
                    }
                } > Edit Profile </button>
                </div>
              </div>
            </div>
          </div>

          {/* ======================= About Me Section ======================= */}
          <div className="mt-8 bg-gray-800 p-6 rounded-lg shadow-lg">
            <h3 className="text-white text-xl font-bold mb-3">About Me</h3>
            <p className="text-gray-300 text-base">
              {ProfileData.bio || "No bio available."}
            </p>
          </div>
 {/* About Section*/}
    <div className="bg-gray-800 rounded-2xl p-8 shadow-xl text-white mt-4">
        <h2 className="text-2xl font-bold text-center">About</h2>
        <hr className="my-6 border-gray-600" />
        <p className="text-gray-300 text-lg leading-relaxed text-center">
           {ProfileData?.bio}
          </p>
      </div>
   {/* Experience */}
    {ProfileData?.experience?.length && (
    <div className="bg-gray-800 rounded-2xl p-8 shadow-xl text-white mt-4">
      <h2 className="text-2xl font-bold text-center">Filmography & Experience</h2>
      <hr className="my-6 border-gray-600" />

      {/* Container for the list of experiences */}
      <div className="space-y-0">
        {ProfileData?.experience?.map((exp,index) => (
          
          <div key={index} className="flex gap-4 sm:gap-6">
            
           
            <div className="flex-grow">
              <h3 className="text-xl font-bold text-white">{exp.role}</h3>
              <p className="text-sm text-gray-400 mt-1">{exp.duration}</p>
              <p className="text-base text-gray-300 mt-1 leading-relaxed">
                {exp.description}
              </p>
              <hr className="my-6 border-gray-600" />
            </div>

          </div>
        ))}
      </div>
    </div>)}
          

    {/* Education */}
    {ProfileData?.education?.length && (
        <div className="bg-gray-800 rounded-2xl p-8 shadow-xl text-white mt-4">
      <h2 className="text-2xl font-bold text-center">Education & Training</h2>
      <hr className="my-6 border-gray-600" />
      <div className="space-y-0">
        {ProfileData?.education.map((edu,index) => (
          
          <div key={index} className="flex gap-4 sm:gap-6">
            
           
            <div className="flex-grow">
              <h3 className="text-xl font-bold text-white">{edu.course}</h3>
              <p className="text-sm text-gray-400 mt-1"> {edu.institute}&nbsp;&nbsp;&nbsp;{edu.duration}</p>
              <p className="text-base text-gray-300 mt-1 leading-relaxed">
                {edu.description}
              </p>
              <hr className="my-6 border-gray-600" />
            </div>

          </div>
        ))}
      </div>
    </div>)}

          {/* ======================= Skills & Expertise Section ======================= */}
          <div className="mt-6 bg-gray-800 p-6 rounded-lg shadow-lg">
            <h3 className="text-white text-xl font-bold mb-4">Skills & Expertise</h3>
            {ProfileData.skills?.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {ProfileData.skills.map((skill, index) => (
                  <span key={index} className="bg-gray-700 text-gray-200 px-4 py-2 rounded-md text-sm font-medium">
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-gray-400">No skills added yet.</p>
            )}
          </div>

          {/* ======================= Portfolio & Social Section ======================= */}
          <div className="mt-6 bg-gray-800 p-6 rounded-lg shadow-lg">
            <h3 className="text-white text-xl font-bold mb-4">Portfolio & Social</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <a href="#" className="flex items-center gap-3 text-gray-300 hover:text-yellow-400 transition">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M22 17H2v-2h20v2zm0-4H2v-2h20v2zm0-4H2V7h20v2z"/></svg>
                  <span>IMDb Profile</span>
                </a>
                <a href="#" className="flex items-center gap-3 text-gray-300 hover:text-yellow-400 transition">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M10.749 6.22c-2.31 0-3.905 1.547-4.786 4.093l-1.571 5.093h2.934l.75-2.613c.783-2.52 1.393-3.153 2.15-3.153.942 0 1.637.753 1.637 1.838 0 1.25-.972 2.375-3.036 3.256l-1.396.643 2.506 3.125h2.89c.758-2.66 2.31-6.195 4.757-6.195 1.956 0 2.923 1.365 2.923 2.723 0 2.22-.926 3.704-2.835 3.704-1.282 0-1.892-.768-2.597-2.61l-1.427.65c.987 2.457 2.31 3.79 4.318 3.79 3.036 0 4.88-2.062 4.88-5.182 0-2.843-1.822-5.167-5.06-5.167zm-7.653 0c-2.31 0-3.905 1.547-4.786 4.093l-1.571 5.093h2.934l.75-2.613c.783-2.52 1.393-3.153 2.15-3.153.942 0 1.637.753 1.637 1.838 0 1.25-.972 2.375-3.036 3.256l-1.396.643 2.506 3.125h2.89c.758-2.66 2.31-6.195 4.757-6.195 1.956 0 2.923 1.365 2.923 2.723 0 2.22-.926 3.704-2.835 3.704-1.282 0-1.892-.768-2.597-2.61l-1.427.65c.987 2.457 2.31 3.79 4.318 3.79 3.036 0 4.88-2.062 4.88-5.182 0-2.843-1.822-5.167-5.06-5.167z"/></svg>
                  <span>Vimeo Portfolio</span>
                </a>
                <a href="#" className="flex items-center gap-3 text-gray-300 hover:text-yellow-400 transition">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.41-7-7.93s3.05-7.44 7-7.93v15.86zm2 0V4.07c3.95.49 7 3.41 7 7.93s-3.05 7.44-7 7.93z"/></svg>
                  <span>Personal Website</span>
                </a>
                <a href="#" className="flex items-center gap-3 text-gray-300 hover:text-yellow-400 transition">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                  <span>LinkedIn</span>
                </a>
            </div>
          </div>

        </div>
      </div>
    </>
  );
};