import React, { useState,useRef } from "react";
import { supabase } from "../lib/supabaseClient";

import { useNavigate } from "react-router-dom";
import { ProfileData,DEFAULT_COVER_PHOTO,DEFAULT_PROFILE_PHOTO,filmRoles,checkSession } from "../data/pricing";
import { useLocation } from "react-router-dom";
interface LocationState {
    initialProfileData: ProfileData;
}
const EditProfile: React.FC = () => {
    const navigate = useNavigate();
    const myRef = useRef(null);
   const location = useLocation();
    const receivedData = (location.state as LocationState)?.initialProfileData;
    const [profile, setProfile] = useState<ProfileData>(receivedData)
    const [showCustomInput, setShowCustomInput] = useState(false);
    const [customSkill, setCustomSkill] = useState('');
    const [selectedCraft, setSelectedCraft] = useState('');

    const addSkill = (skill: string) => {
        const trimmedSkill = skill.trim();
        if (trimmedSkill && !profile.skills?.includes(trimmedSkill)) {
        setProfile((prev:ProfileData) => ({
            ...prev,
            skills: [...(prev.skills || []), trimmedSkill],
        }));
    }
    setCustomSkill('');
    setShowCustomInput(false);
    setSelectedCraft('');
    };
    if (!receivedData) {
        return <div className="p-8 text-white">Please navigate from the User Profile page to edit.</div>;
    }
    const handleAddExperience = () => {
        const newExperience = {
            company: '',
            role: '',
            duration: '',
            description: '',
            startDate: '',
            endDate: '',
        };
        setProfile(prev => ({
            ...prev,
            experience: [...(prev.experience || []), newExperience],
        }));
    }
    const handleRemoveExperience = (index:number) => {
    setProfile(prev => ({
        ...prev,
        experience: prev.experience?.filter((_,expindex) => expindex !== index) || null,
        }));
    };
    const handleUpdateExperience = (index:number,field:string,value:string) =>{
        setProfile(prev => ({
            ...prev,
            experience: prev.experience?.map((exp,expindex) => 
            expindex === index ? { ...exp, [field]: value } : exp
            ) || null,
    }));
    }
    const handleAddEducation = () => {
    const newEducation = {
        institute: "",
        course: "",
        duration: "",
        description: "",
    };

    setProfile(prev => ({
        ...prev,
        education: [newEducation, ...(prev.education || [])],
    }));
    };
    const handleUpdateEducation = (index:number, field:string, value: string) => {
    setProfile(prev => ({
        ...prev,
        education: prev.education?.map((edu,eduindex) => 
            (eduindex === index ? { ...edu, [field]: value } : edu
        ) || null,
    )}));
    };
    const handleRemoveEducation = (index:number) => {
    setProfile(prev => ({
        ...prev, 
        education: prev.education?.filter((_,eduindex) => eduindex !== index) || null,
    }));
    };
    const saveUpdatedProfile = async () => {
        try {
            const session = await checkSession();
            if (!session) {
                console.log("No active session. Cannot update profile.");
                navigate('/login');
                return;
            }   
            const userId = session?.[0];
            const { error } = await supabase.from("profiles").select("*").eq("user_id", userId).single();
            if(error){
                console.error("Error fetching profile:", error);
                return;
            }
            const savedata = {...profile, user_id: userId};
            const { error: updateError } = await supabase
                .from("profiles")
                .update(savedata)
                .eq("user_id", userId).select().single();
            if (updateError) {
                console.error("Error updating profile:", updateError);
                alert(`Failed to save changes`);
                return;
            } 
            navigate('/userprofile');
        }
        catch (error) {
            console.error("Unexpected error:", error);
            alert("An unexpected error occurred while saving the profile.");
        }
        
     }
    const handleProfilePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return console.log("No file selected.");

    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;
    if (!user) return console.error("User not authenticated.");

    const filePath = `${user.id}_profile_photo.jpeg`;

    const { data: uploadData, error: uploadError } = await supabase.storage
        .from('profile-photos')
        .upload(filePath, file, { upsert: true });

    if (uploadError || !uploadData) return console.error("Upload failed:", uploadError);

    const { data: publicData} = supabase.storage
        .from('profile-photos')
        .getPublicUrl(uploadData.path);

    if (!publicData || !publicData.publicUrl) {
    console.error("Error getting public URL");
    return;
    }

    const profilePhotoUrlArray = publicData.publicUrl.split('/');
    const profilePhotoUrl = profilePhotoUrlArray[profilePhotoUrlArray.length - 1];
    console.log("Profile photo uploaded to:", profilePhotoUrl);

    setProfile(prev => ({
        ...prev,
        profilePhoto: profilePhotoUrl,
    }));

    const { error: updateError } = await supabase
        .from('profiles')
        .update({ profilePhoto: filePath })
        .eq('user_id', user.id).select().maybeSingle();

    if (updateError) console.error("Failed to save to profile table:", updateError.message);
    else console.log("Profile photo updated successfully!");
    };

    const handleCoverPhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
        console.log("No file selected for cover photo.");
        return;
    }

    const { data: userData, error: userError } = await supabase.auth.getUser();
    const user = userData?.user;
    if (userError || !user) {
        console.error("User not authenticated. Cannot upload cover photo.");
        return;
    }

    const bucketName = 'cover-photos';
    const filePath = `${user.id}_cover_photo.jpeg`;

    const { data: uploadData, error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file, {
        upsert: true,
        contentType: file.type,
        });

    if (uploadError || !uploadData) {
        console.error("Error uploading cover photo:", uploadError?.message);
        return;
    }

    const { data: publicData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(uploadData.path);

    if (!publicData?.publicUrl) {
        console.error("Error getting public URL for cover photo.");
        return;
    }

    const coverPhotoUrlArray = publicData.publicUrl.split('/');
    const coverPhotoUrl = coverPhotoUrlArray[coverPhotoUrlArray.length - 1];
    console.log("Cover photo uploaded to:", coverPhotoUrl);

    setProfile(prev => ({
        ...prev,
        coverPhoto: coverPhotoUrl,
    }));

    const { error: updateError } = await supabase
        .from('profiles')
        .update({ coverPhoto: coverPhotoUrl })
        .eq('user_id', user.id)
        .select()
        .maybeSingle(); 
    if (updateError) {
        console.error("Failed to save cover photo to profile table:", updateError.message);
    } else {
        console.log("Cover photo updated successfully!");
    }
    };

    return ( 
        <>
            <div className="bg-gray-900 min-h-screen p-6 sm:p-8 lg:p-12 text-gray-100 font-sans">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-bold mb-8">Edit Your Profile</h1>

                {/* Cover Photo & Profile Picture Section */}
                <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden relative mb-8">
                    {/* Cover Photo */}
                    <div className="relative h-48 sm:h-64 md:h-72 w-full group">
                        <img
                        src={profile.coverPhoto || DEFAULT_COVER_PHOTO}
                        alt="Cover Photo"
                        className="w-full h-full object-cover transition duration-300 ease-in-out group-hover:opacity-75"
                        />
                        
                        {/* Wrap input in a label so click anywhere triggers file select */}
                        <label className="absolute inset-0 cursor-pointer">
                        <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleCoverPhotoUpload} 
                            aria-label="Upload Cover Photo"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 
                                        group-hover:opacity-100 transition duration-300 ease-in-out pointer-events-none">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span className="ml-2 text-white text-lg">Change Cover</span>
                        </div>
                        </label>
                    </div>

                    {/* Profile Picture */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                        <div className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-full border-4 border-gray-900 bg-gray-700 shadow-xl group">
                        <img
                            src={profile.profilePhoto || DEFAULT_PROFILE_PHOTO}
                            alt="Profile"
                            className="w-full h-full object-cover rounded-full transition duration-300 ease-in-out group-hover:opacity-75"
                        />
                        
                        {/* Wrap input in label */}
                        <label className="absolute inset-0 cursor-pointer rounded-full z-20">
                            <input
                                type="file"
                                ref={myRef}
                                accept="image/*"
                                className="hidden"
                                onChange={handleProfilePhotoUpload} 
                                aria-label="Upload Profile Photo"
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300 ease-in-out rounded-full pointer-events-none"></div>

                            {/* Camera button inside the label */}
                            <div className="absolute bottom-0 right-0 p-3 bg-blue-600 rounded-full shadow-lg hover:bg-blue-500 transition duration-300 z-30 flex items-center justify-center">
                                <i className="fa-regular fa-camera text-white"></i>
                            </div>
                        </label>

                    </div>
                </div>
            </div>


                {/* Personal Details Section */}
                <div className="mt-4 sm:mt-28 bg-gray-800 p-8 rounded-lg shadow-lg">
                    <h2 className="text-2xl font-semibold mb-6">Personal Details</h2>

                    {/* Full Name & Headline */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <label htmlFor="fullName" className="block text-gray-400 text-sm font-medium mb-2">Full Name</label>
                            <input
                                type="text"
                                id="fullName"
                                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md focus:ring-yellow-500 focus:border-yellow-500 text-gray-50"
                                value={profile.name}
                                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                            />
                        </div>
                        <div>
                            <label htmlFor="headline" className="block text-gray-400 text-sm font-medium mb-2">Headline</label>
                            <input
                                type="text"
                                id="headline"
                                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md focus:ring-yellow-500 focus:border-yellow-500 text-gray-50"
                                value={profile.role}
                                onChange={(e) => setProfile({ ...profile, role: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Bio */}
                    <div className="mb-6">
                        <label htmlFor="bio" className="block text-gray-400 text-sm font-medium mb-2">Bio</label>
                        <textarea
                            id="bio"
                            rows={5}
                            className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md focus:ring-yellow-500 focus:border-yellow-500 text-gray-50 resize-y"
                            value={profile.bio}
                            onChange={(e) => setProfile({ ...profile, bio: e.target.value })} // Corrected: profile.bio
                        ></textarea>
                    </div>

                    {/* Location & Date of Birth */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <label htmlFor="location" className="block text-gray-400 text-sm font-medium mb-2">Location</label>
                            <input
                                type="text"
                                id="location"
                                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md focus:ring-yellow-500 focus:border-yellow-500 text-gray-50"
                                value={profile.location}
                                onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                            />
                        </div>
                        <div>
                            <label htmlFor="dob" className="block text-gray-400 text-sm font-medium mb-2">Date of Birth</label>
                            <input
                                type="dob"
                                id="dob"
                                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md focus:ring-yellow-500 focus:border-yellow-500 text-gray-50"
                                value={profile.dob}
                                onChange={(e) => setProfile({ ...profile, dob: e.target.value })}
                            />
                        </div>
                    </div>
                </div>



                {/*Contact & Professional Links Section*/}
                <div className="mt-8 bg-gray-800 p-8 rounded-lg shadow-lg">
                    <h2 className="text-2xl font-semibold mb-6">Contact Information & Links</h2>

                    {/* Row 1: Email Address & Phone Number */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <label htmlFor="email" className="block text-gray-400 text-sm font-medium mb-2">Email Address</label>
                            <input
                                type="email"
                                disabled
                                id="email"
                                className="w-full p-3 bg-gray-800 border border-gray-600 rounded-md focus:ring-yellow-500 focus:border-yellow-500 text-gray-50"
                                value={profile.email}
                                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                                placeholder="example@cinematic.com"
                            />
                        </div>
                        <div>
                            <label htmlFor="phone" className="block text-gray-400 text-sm font-medium mb-2">Phone Number</label>
                            <input
                                type="tel" // Use type="tel" for phone numbers
                                id="phone"
                                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md focus:ring-yellow-500 focus:border-yellow-500 text-gray-50"
                                value={profile.phone}
                                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                                placeholder="+1 (555) 123-4567"
                            />
                        </div>
                    </div>

                    {/* Row 2: IMDb Profile Link & LinkedIn Profile */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="instagram" className="block text-gray-400 text-sm font-medium mb-2">Instagram Link</label>
                            <input
                                type="url"
                                id="instagram"
                                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md focus:ring-yellow-500 focus:border-yellow-500 text-gray-50"
                                // Assuming you have an 'instagram' field in ProfileData
                                value={profile.instagram || ''}
                                onChange={(e) => setProfile({ ...profile, instagram: e.target.value })}
                                placeholder="instagram.com/janedoe"
                            />
                        </div>
                        <div>
                            <label htmlFor="socialLink" className="block text-gray-400 text-sm font-medium mb-2">Other Social Media Link ( TikTok, Youtube)</label>
                            <input
                                type="url"
                                id="socialLink"
                                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md focus:ring-yellow-500 focus:border-yellow-500 text-gray-50"
                                value={profile.socialLink || ''} 
                                onChange={(e) => setProfile({ ...profile, socialLink: e.target.value })} 
                                placeholder="youtube.com/janedoe"
                            />
                        </div>
                    </div>
                </div>


                {/*Career History Section*/}
                <div className="mt-8 bg-gray-800 p-8 rounded-lg shadow-lg">
                    <h2 className="text-2xl font-semibold mb-6">Career History</h2>

                    {profile.experience?.map((exp,index) => (
                        <div key={index} className="border border-gray-700 p-6 rounded-lg mb-6 last:mb-0">
                            {/* Row 1: Role & Company */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                                <div>
                                    <label htmlFor={`role-${index}`} className="block text-gray-400 text-sm font-medium mb-2">Role</label>
                                    <input
                                        type="text"
                                        id={`role-${exp.role}`}
                                        className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md text-gray-50 focus:ring-yellow-500 focus:border-yellow-500"
                                        value={exp.role}
                                        onChange={(e) => handleUpdateExperience(index, 'role', e.target.value)}
                                        placeholder="Director of Photography"
                                    />
                                </div>
                                <div>
                                    <label htmlFor={`company-${index}`} className="block text-gray-400 text-sm font-medium mb-2">Company</label>
                                    <input
                                        type="text"
                                        id={`company-${index}`}
                                        className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md text-gray-50 focus:ring-yellow-500 focus:border-yellow-500"
                                        value={exp.company}
                                        onChange={(e) => handleUpdateExperience(index, 'company', e.target.value)}
                                        placeholder="CinemaVision Studios"
                                    />
                                </div>
                            </div>

                            {/* Row 2: Start Date & End Date */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                                <div>
                                    <label htmlFor={`start-date-${index}`} className="block text-gray-400 text-sm font-medium mb-2">Start Date</label>
                                    <input
                                        type="date"
                                        id={`start-date-${exp.startDate}`}
                                        className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md text-gray-50 focus:ring-yellow-500 focus:border-yellow-500"
                                        value={exp.startDate}
                                        onChange={(e) => handleUpdateExperience(index, 'startDate', e.target.value)}
                                        disabled={exp.currentlyWorking} // Disable if currently working
                                    />
                                </div>
                                <div>
                                    <label htmlFor={`end-date-${index}`} className="block text-gray-400 text-sm font-medium mb-2">End Date</label>
                                    <input
                                        type="date"
                                        id={`end-date-${index}`}
                                        className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md text-gray-50 focus:ring-yellow-500 focus:border-yellow-500"
                                        value={exp.endDate}
                                        onChange={(e) => handleUpdateExperience(index, 'endDate', e.target.value)}
                                        disabled={exp.currentlyWorking}
                                    />
                                    <div className="flex items-center mt-2">
                                        <input
                                            type="checkbox"
                                            id={`current-${index}`}
                                            className="h-4 w-4 text-yellow-500 bg-gray-700 border-gray-600 rounded focus:ring-yellow-500"
                                            checked={exp.currentlyWorking}
                                        />
                                        <label htmlFor={`current-${index}`} className="ml-2 text-sm text-gray-400">
                                            Currently working here
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {/* Description */}
                            <div className="mb-4">
                                <label htmlFor={`description-${index}`} className="block text-gray-400 text-sm font-medium mb-2">Description</label>
                                <textarea
                                    id={`description-${index}`}
                                    rows={4}
                                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md text-gray-50 focus:ring-yellow-500 focus:border-yellow-500 resize-y"
                                    value={exp.description}
                                    onChange={(e) => handleUpdateExperience(index, 'description', e.target.value)}
                                    placeholder="Led cinematography for feature films..."
                                ></textarea>
                            </div>

                            {/* Remove Button */}
                            <div className="flex justify-end">
                                <button
                                    type="button"
                                    onClick={() => handleRemoveExperience(index)}
                                    className="text-red-400 hover:text-red-500 font-medium py-2 px-4 rounded transition duration-300"
                                >
                                    Remove Role
                                </button>
                            </div>
                        </div>
                    ))}

                    {/* Add New Role Button */}
                    <button
                        type="button"
                        onClick={handleAddExperience}
                        className="mt-6 w-full bg-dark-200 text-white-900 font-bold py-3 rounded-lg shadow hover:bg-dark-800 transition duration-300"
                    >
                        Add New Role
                    </button>
                </div>


                {/*Education History Section */}
                <div className="mt-8 bg-gray-800 p-8 rounded-lg shadow-lg">
                    <h2 className="text-2xl font-semibold mb-6">Education History</h2>
                    {profile.education?.map((edu, index) => (
                      
                        <div key={index} className="border border-gray-700 p-6 rounded-lg mb-6 last:mb-0">
                            
                            {/* Row 1: Course & Institute */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                                <div>
                                    <label htmlFor={`course-${index}`} className="block text-gray-400 text-sm font-medium mb-2">Course/Major</label>
                                    <input
                                        type="text"
                                        id={`course-${index}`}
                                        className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md text-gray-50 focus:ring-yellow-500 focus:border-yellow-500"
                                        value={edu.course}
                                        onChange={(e) => handleUpdateEducation(index, 'course', e.target.value)}
                                        placeholder="Master of Fine Arts in Cinematography"
                                    />
                                </div>
                                <div>
                                    <label htmlFor={`institute-${index}`} className="block text-gray-400 text-sm font-medium mb-2">Institute/School</label>
                                    <input
                                        type="text"
                                        id={`institute-${index}`}
                                        className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md text-gray-50 focus:ring-yellow-500 focus:border-yellow-500"
                                        value={edu.institute}
                                        onChange={(e) => handleUpdateEducation(index, 'institute', e.target.value)}
                                        placeholder="NYU Tisch School of the Arts"
                                    />
                                </div>
                            </div>

                            {/* Row 2: Duration (Year) */}
                            <div className="mb-4">
                                <label htmlFor={`duration-${index}`} className="block text-gray-400 text-sm font-medium mb-2">Duration (e.g., 2018 - 2020)</label>
                                <input
                                    type="text"
                                    id={`duration-${index}`}
                                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md text-gray-50 focus:ring-yellow-500 focus:border-yellow-500"
                                    value={edu.duration}
                                    onChange={(e) => handleUpdateEducation(index, 'duration', e.target.value)}
                                    placeholder="2018 - 2020"
                                />
                            </div>

                            {/* Description */}
                            <div className="mb-4">
                                <label htmlFor={`description-${index}`} className="block text-gray-400 text-sm font-medium mb-2">Description</label>
                                <textarea
                                    id={`description-${index}`}
                                    rows={4}
                                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md text-gray-50 focus:ring-yellow-500 focus:border-yellow-500 resize-y"
                                    value={edu.description}
                                    onChange={(e) => handleUpdateEducation(index, 'description', e.target.value)}
                                    placeholder="Learned advanced digital cinema techniques..."
                                ></textarea>
                            </div>

                            {/* Remove Button */}
                            <div className="flex justify-end">
                                <button
                                    type="button"
                                    onClick={() => handleRemoveEducation(index)}
                                    className="text-red-400 hover:text-red-500 font-medium py-2 px-4 rounded transition duration-300"
                                >
                                    Remove Education
                                </button>
                            </div>
                        </div>
                    ))}

                    {/* Add New Education Button */}
                    <button
                        type="button"
                        onClick={handleAddEducation}
                        className="mt-6 w-full bg-dark-200 text-white-900 font-bold py-3 rounded-lg shadow hover:bg-dark-800 transition duration-300"
                    >
                        Add New Education
                    </button>
                </div>

                {/* Professional Skills Section */}
                <div className="mt-8 bg-gray-800 p-8 rounded-lg shadow-lg">
                    <h2 className="text-2xl font-semibold mb-6">Professional Skills</h2>

                    {/* Display Current Skills */}
                    <div className="flex flex-wrap gap-3 mb-6">
                        {profile.skills && profile.skills.map((skill, index) => (
                            <div
                                key={index}
                                className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium"
                            >
                                {skill}
                                <button
                                    type="button"
                                    onClick={() => setProfile(prev => ({
                                        ...prev,
                                        skills: prev.skills?.filter(s => s !== skill),
                                    }))}
                                    className="ml-2 text-white/80 hover:text-white transition duration-200"
                                >
                                    &times;
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Skill Input Area */}
                    <div className="relative">
                        
                        {/* Dropdown for 24 Crafts and 'Other' option */}
                        <select
                            value={selectedCraft}
                            onChange={(e) => {
                                const value = e.target.value;
                                setSelectedCraft(value);
                                if (value === 'other') {
                                    setShowCustomInput(true);
                                } else if (value) {
                                    addSkill(value);
                                }
                            }}
                            className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md focus:ring-yellow-500 focus:border-yellow-500 text-gray-50"
                        >
                            <option value="" disabled>Add a new skill (Select a Craft)</option>
                            {/* Map the 24 Crafts */}
                            {filmRoles.filter(craft => !profile.skills?.includes(craft)).map(craft => (
                                <option key={craft} value={craft}>{craft}</option>
                            ))}
                            <option value="other">Other (Specify Manually)</option>
                        </select>
                        
                        {/* Custom Input Box (Conditionally rendered) */}
                        {showCustomInput && (
                            <div className="mt-4 flex items-center gap-3">
                                <input
                                    type="text"
                                    value={customSkill}
                                    onChange={(e) => setCustomSkill(e.target.value)}
                                    placeholder="Enter your custom skill (e.g., Drone Operation)"
                                    className="flex-grow p-3 bg-gray-700 border border-gray-600 rounded-md focus:ring-yellow-500 focus:border-yellow-500 text-gray-50"
                                />
                                {/* OK Button */}
                                <button
                                    type="button"
                                    onClick={() => customSkill.trim() && addSkill(customSkill)}
                                    className="bg-yellow-500 text-gray-900 px-4 py-3 rounded-md font-semibold hover:bg-yellow-400 transition duration-300"
                                >
                                    Add
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/*Save/Cancel Footer*/}
                <div className="mt-10 mb-8 p-4 bg-gray-900 sticky bottom-0 z-30 border-t border-gray-700">
                    <div className="flex justify-end gap-4">
                        
                        {/* Cancel Button */}
                        <button
                            type="button"
                            onClick={() => navigate(-1)} 
                            className="px-6 py-3 border-2 border-gray-500 text-gray-100 rounded-md font-semibold 
                                    hover:border-white hover:text-white transition duration-300 shadow-xl"
                        >
                            Cancel
                        </button>

                        {/* Save Changes Button */}
                        <button
                            type="submit"
                            onClick={() => { 
                                saveUpdatedProfile();
                                navigate(-1);
                            }}
                            className="px-6 py-3 bg-yellow-500 text-gray-900 rounded-md font-bold 
                                    hover:bg-yellow-400 transition duration-300 shadow-xl"
                        >
                            Save Changes
                        </button>
                    </div>
                </div>
            </div>
        </div>
        </>
    );
};

export default EditProfile;