import React, { useEffect, useState } from "react";
import "./UserProfile.css";
import { supabase } from "../lib/supabaseClient";

type Experience = {
  company: string;
  role: string;
  duration: string;
  description: string;
};

type Education = {
  institute: string;
  course: string;
  duration: string;
  description: string;
};
type skills = string[]



 export type ProfileData = {
  name: string;
  role: string;
  location: string;
  bio: string;
  coverPhoto: string;
  profilePhoto: string;
  experience: Experience[];
  skills: skills[];
  education: Education[];
  plan: string;
};

interface ProfileProps {
  onPageChange: (page: string) => void;
}

export const UserProfile: React.FC<ProfileProps> = ({ onPageChange }) => {
  const [ProfileData, setProfileData] = useState<ProfileData>({
    name: "",
    role: "",
    location: "",
    bio: "",
    coverPhoto: "",
    profilePhoto: "",
    experience: [],
    skills: [],
    education: [],
    plan: "",
  });
  const [UpdateProfileData, setUpdateProfileData] = useState<ProfileData>({
    name: "",
    role: "",
    location: "",
    bio: "",
    coverPhoto: "",
    profilePhoto: "",
    experience: [],
    skills: [],
    education: [],
    plan: "",
  });

  const [modal, setModal] = useState(false);

  const checkSession = async ()=>{
    const {data} = await supabase.auth.getSession();
    if (data?.session) {
    const userId = data.session.user.id;
    const userName = data.session.user.identities?.[0]?.identity_data?.name || "";
    
    console.log("User ID:", userId);
    console.log("User Name:", userName);

    return [userId, userName];
    }
    else{
      console.log("No active session is there");
    }
  }


const fetchData = async () => {
  let loginId = await checkSession();
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
        console.log("Final Profile Data:", data);
       setProfileData(data);
       return;
    }
    console.log("Final Profile Data (Fetched):", data);
    setProfileData(data);
};



  useEffect(() => {
    fetchData();
  }, []);

const [updaterole, setupdaterole] = useState({
  role: "",      
  otherRole: "", 
});


const updateData = async (e: React.FormEvent) => {
  e.preventDefault();

  let loginId = await checkSession();
  if (!loginId) {
    console.log("User not logged in!");
    return;
  }

  const user_id = loginId[0];
  const userrole = updaterole.role === "Others" ? updaterole.otherRole : updaterole.role;

  const updatedData = {
    ...UpdateProfileData,
    role: userrole,
  };

  console.log("Updating user_id:", user_id);
  console.log("Final update data:", updatedData);
const { data, error } = await supabase
  .from("profiles")
  .update({...updatedData }) 
  .eq("user_id", user_id)
  .select();

console.log("Test update data:", data);
console.log("Test update error:", error);

  if (error) {
    console.error("Supabase error:", error);
    return;
  }
else{
  console.log("Updated profile:", data);
  setProfileData(data[0]);
  setModal(false);
}
};




const DeleteExpericence = (index: number) => {
  const updatedExperience = [...UpdateProfileData.experience];
  updatedExperience.splice(index, 1);
  setUpdateProfileData({
    ...UpdateProfileData,
    experience: updatedExperience
  });
};

const DeleteEducation = (index:number)=>{
    const updateEducation = [...UpdateProfileData.education];
    updateEducation.splice(index,1);
    setUpdateProfileData({...UpdateProfileData,education:updateEducation})
}

const [editingEduIndex, setEditingEduIndex] = useState<number | null>(null);

const [editingIndex, setEditingIndex] = useState<number | null>(null);

const startEdit = (index: number) => {
  setEditingIndex(index);
};

const saveEdit = (index: number, updatedData: any) => {
  const updatedExperiences = [...UpdateProfileData.experience];
  updatedExperiences[index] = updatedData;

  setUpdateProfileData({
    ...UpdateProfileData,
    experience: updatedExperiences,
  });

  setEditingIndex(null); 
};
const startEditEdu = (index: number) => {
  setEditingEduIndex(index);
};

const saveEditEdu = (index: number, updatedData: Education) => {
  const updatedEducation = [...UpdateProfileData.education];
  updatedEducation[index] = updatedData;

  setUpdateProfileData({
    ...UpdateProfileData,
    education: updatedEducation,
  });

  setEditingEduIndex(null); 
};
const [newExperience, setNewExperience] = useState<Experience>({
  company: "",
  role: "",
  duration: "",
  description: "",
});

const [newEducation, setNewEducation] = useState<Education>({
  institute: "",
  course: "",
  duration: "",
  description: "",
});
const [isAddingExperience, setIsAddingExperience] = useState(false);
const [isAddingEducation,setisAddingEducation] = useState(false);

const addnewExpEdu = (type: string) => {
  if (type === "Experience") {
    setIsAddingExperience(true);
  } else if (type === "Education") {
    setisAddingEducation(true);
  }
};
const saveNewExperience = () => {
  const updatedExperience = [...(UpdateProfileData.experience || []), newExperience];
  setUpdateProfileData({
    ...UpdateProfileData,
    experience: updatedExperience,
  });
  setIsAddingExperience(false);
  setNewExperience({ company: "", role: "", duration: "", description: "" });
};

const saveNewEducation = () => {
  const updatedEducation = [...(UpdateProfileData.education || []), newEducation];
  setUpdateProfileData({
    ...UpdateProfileData,
    education: updatedEducation,
  });
  setisAddingEducation(false);
  setNewEducation({ institute: "", course: "", duration: "", description: "" });
};








return (
    <>
      <div className="bg-gray-900 min-h-screen flex flex-col items-center">
        <div className="w-full max-w-5xl bg-gray-900 px-4 md:px-8">
          
          <div className="relative bg-gray-800 rounded-lg overflow-hidden">
            
          <div className="h-48 w-full">
            <img
              src={ProfileData.coverPhoto || "https://images.unsplash.com/photo-1503264116251-35a269479413"} 
              alt="Cover"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="relative flex flex-col md:flex-row items-center md:items-end p-6">
              
            <div className="absolute -top-16 md:-top-20 left-1/2 md:left-10 transform -translate-x-1/2 md:translate-x-0 profile">
              <img
                src={ProfileData.profilePhoto || "https://tse3.mm.bing.net/th/id/OIP.apRNXJkvlf4bc55gw0dXLQHaHa?pid=Api&P=0&h=180"}
                alt="Profile"
                className="w-32 h-32 rounded-full border-4 border-white shadow-lg"
                />
            </div>

            <div className="mt-20 md:mt-0 md:ml-40 text-center md:text-left">
              <h1 className="text-2xl font-bold text-white">
                {ProfileData.name}
              </h1>
              <p className="text-gray-300 text-lg">
                {ProfileData.role || ""}
              </p>
              <p className="text-gray-400">
                {ProfileData.location || ""}
              </p>
            </div>

            <div className="ml-auto mt-4 md:mt-0">
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700"
                onClick={() => {
                  setUpdateProfileData(JSON.parse(JSON.stringify(ProfileData)));
                  setModal(true);
                }}

                >Edit Profile
              </button>
            </div>
          </div>
        </div>

          <div className="mt-8 bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-gray-900 text-xl font-semibold mb-3">About</h3>
            <p className="text-gray-700 text-base">
              {ProfileData.bio || "Nothing great added yet."}
            </p>
          </div>

          <div className="mt-6 bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-gray-900 text-xl font-semibold mb-3">
              Experience
            </h3>
            {ProfileData.experience && ProfileData.experience.length > 0 ? (
              ProfileData.experience.map((exp, i) => (
                <div
                  key={i}
                  className="mb-4 pb-4 border-b border-gray-200 last:border-b-0 last:pb-0"
                >
                  <h4 className="text-lg font-medium text-gray-800">
                    {exp.role}
                  </h4>
                  <p className="text-gray-600">{exp.company}</p>
                  <p className="text-gray-500 text-sm">{exp.duration}</p>
                  <p className="text-gray-700 mt-2">{exp.description}</p>
                </div>
              ))
            ) : (
              <p className="text-gray-700">
                No experience added yet. Add experience to enhance your profile.
              </p>
            )}
          </div>

          <div className="mt-6 bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-gray-900 text-xl font-semibold mb-3">
              Education
            </h3>
            {ProfileData.education && ProfileData.education.length > 0 ? (
              ProfileData.education.map((edu, idx) => (
                <div
                  key={idx}
                  className="mb-4 pb-4 border-b border-gray-200 last:border-b-0 last:pb-0"
                >
                  <h5 className="text-lg font-medium text-gray-800">
                    {edu.course}
                  </h5>

                  <p className="text-gray-700">{edu.institute}</p>

                  <small className="text-gray-500 block mb-2">
                    {edu.duration}
                  </small>

                
                  {edu.description && (
                    <p className="mt-2 text-gray-600">{edu.description}</p>
                  )}
                </div>
              ))
            ) : (
              <p className="text-gray-700">
                No education added yet. Add education to enhance your profile.
              </p>
            )}
          </div>
      </div>



<div className="mt-6 bg-white p-6 rounded-lg shadow-lg skills">
  <h3 className="text-gray-900 text-xl font-semibold mb-3">Skills</h3>
  {ProfileData.skills?.length > 0 ? (
    <div className="flex flex-wrap gap-3">
      {ProfileData.skills.map((skill, index) => (
        <span
          key={index}
          className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium shadow hover:bg-blue-200 transition"
        >
          {skill}
        </span>
      ))}
    </div>
  ) : (
    <p className="text-gray-700">
      No skills added yet. Add skills to enhance your profile.
    </p>
  )}
</div>



      </div>

      {modal && (
        <div
          className="modal d-block"
          style={{ background: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5>Edit Profile</h5>
                <button
                  className="btn-close"
                  onClick={() => setModal(false)}
                ></button>
              </div>

<div className="modal-body">

  <div className="mb-3">
    <label htmlFor="name" className="form-label text-dark">
      Name
    </label>
    <input
      type="text"
      className="form-control"
      value={UpdateProfileData.name}
      onChange={(e) =>
        setUpdateProfileData({
          ...UpdateProfileData,
          name: e.target.value,
        })
      }
    />
  </div>


<div className="mb-3">
  <label htmlFor="role" className="form-label text-dark">
    Role (Movie Craft)
  </label>
  <div className="custom-dropdown-wrapper" style={{ maxHeight: '250px', overflowY: 'auto' }}>
    <select
      id="role"
      className="form-select form-select-tiny"
      value={updaterole.role || UpdateProfileData.role}
      onChange={(e) =>
        setupdaterole({
          ...updaterole,
          role: e.target.value,
        })
      }
      
    >
      <option value="">{updaterole.role}</option>
      <option value="Director">Director</option>
      <option value="Producer">Producer</option>
      <option value="Screenwriter">Screenwriter</option>
      <option value="Cinematographer">Cinematographer</option>
      <option value="Editor">Editor</option>
      <option value="Art Director">Art Director</option>
      <option value="Costume Designer">Costume Designer</option>
      <option value="Music Director">Music Director</option>
      <option value="Sound Designer">Sound Designer</option>
      <option value="Lyricist">Lyricist</option>
      <option value="Playback Singer">Playback Singer</option>
      <option value="Choreographer">Choreographer</option>
      <option value="VFX Artist">VFX Artist</option>
      <option value="Makeup Artist">Makeup Artist</option>
      <option value="Hair Stylist">Hair Stylist</option>
      <option value="Lighting Technician">Lighting Technician</option>
      <option value="Production Designer">Production Designer</option>
      <option value="Assistant Director">Assistant Director</option>
      <option value="Dialogue Writer">Dialogue Writer</option>
      <option value="Casting Director">Casting Director</option>
      <option value="Publicist">Publicist</option>
      <option value="Stunt Coordinator">Stunt Coordinator</option>
      <option value="Actor/Actress">Actor / Actress</option>
      <option value="Dubbing Artist">Dubbing Artist</option>
      <option value="Others">Others</option>
    </select>
  </div>
</div>

{updaterole.role === "Others" && (
  <div className="mb-3">
    <input
      type="text"
      className="form-control"
      placeholder="Enter Your Role"
      onChange={(e) => {
        setupdaterole({ ...updaterole, otherRole: e.target.value });
      }}
    />
  </div>
)}





  <div className="mb-3">
    <label htmlFor="location" className="form-label text-dark">
      Location
    </label>
    <input
      type="text"
      className="form-control"
      value={UpdateProfileData.location}
      onChange={(e) =>
        setUpdateProfileData({
          ...UpdateProfileData,
          location: e.target.value,
        })
      }
    />
  </div>


  <div className="mb-3">
    <label htmlFor="bio" className="form-label text-dark">
      Bio
    </label>
    <input
      className="form-control"
      value={UpdateProfileData.bio}
      onChange={(e) =>
        setUpdateProfileData({
          ...UpdateProfileData,
          bio: e.target.value,
        })
      }
    />
  </div>


<div className="mb-4">
  <label className="form-label text-dark h5 fw-bold">Experience Details</label>

<div className="row">
  {UpdateProfileData?.experience?.length > 0 ? (
    UpdateProfileData.experience.map((exp, index) => (
      <div key={index} className="card mb-3 shadow-sm border-0">
        <div className="card-body">
          {editingIndex === index ? (
            // ===== EDIT MODE =====
            <div>
              <div className="mb-2">
                <label className="form-label">Role</label>
                <input
                  type="text"
                  className="form-control"
                  value={exp.role}
                  onChange={(e) => {
                    const updated = [...UpdateProfileData.experience];
                    updated[index].role = e.target.value;
                    setUpdateProfileData({
                      ...UpdateProfileData,
                      experience: updated,
                    });
                  }}
                />
              </div>
              {/* Company, Duration, Description fields similar to Role */}
              <div className="d-flex justify-content-end gap-2">
                <button
                  className="btn btn-sm btn-success"
                  onClick={() => saveEdit(index, exp)}
                >
                  Save
                </button>
                <button
                  className="btn btn-sm btn-secondary"
                  onClick={() => setEditingIndex(null)}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            // ===== VIEW MODE =====
            <div>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <div>
                  <h5 className="card-title mb-0 text-dark fw-bold">
                    {exp.role}
                  </h5>
                  <small className="text-muted">{exp.company}</small>
                </div>
                <span
                  className="badge text-secondary px-3 py-2"
                  style={{ fontStyle: "italic" }}
                >
                  {exp.duration}
                </span>
              </div>
              {exp.description && (
                <p className="card-text mt-2 text-muted">{exp.description}</p>
              )}
              <div className="d-flex justify-content-end gap-2 mt-2">
                <button
                  className="btn btn-sm p-0 border-0 bg-transparent"
                  onClick={() => startEdit(index)}
                >
                  <i className="fa-solid fa-pen text-secondary"></i>
                </button>
                <button
                  className="btn btn-sm p-0 border-0 bg-transparent"
                  onClick={() => DeleteExpericence(index)}
                >
                  <i className="fa-solid fa-trash text-secondary"></i>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    ))
  ) : (
    <p className="text-muted">No experience added yet.</p>
  )}

  {/* ADD NEW EXPERIENCE FORM */}
   {isAddingExperience && (
      <div className="card mb-3 shadow-sm border-0">
        <div className="card-body">
          <div className="mb-2">
            <label className="form-label">Role</label>
            <input
              type="text"
              className="form-control"
              value={newExperience.role}
              onChange={(e) =>
                setNewExperience({ ...newExperience, role: e.target.value })
              }
            />
          </div>

          <div className="mb-2">
            <label className="form-label">Company</label>
            <input
              type="text"
              className="form-control"
              value={newExperience.company}
              onChange={(e) =>
                setNewExperience({ ...newExperience, company: e.target.value })
              }
            />
          </div>

          <div className="mb-2">
            <label className="form-label">Duration</label>
            <input
              type="text"
              className="form-control"
              value={newExperience.duration}
              onChange={(e) =>
                setNewExperience({ ...newExperience, duration: e.target.value })
              }
            />
          </div>

          <div className="mb-2">
            <label className="form-label">Description</label>
            <textarea
              className="form-control"
              value={newExperience.description}
              onChange={(e) =>
                setNewExperience({ ...newExperience, description: e.target.value })
              }
            />
          </div>

          <div className="d-flex justify-content-end gap-2">
            <button
              className="btn btn-sm btn-success"
              onClick={()=>saveNewExperience()}
            >
              Save
            </button>
            <button
              className="btn btn-sm btn-secondary"
              onClick={() => setIsAddingExperience(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    )}
</div>


  {/* ADD BUTTON */}
  {!isAddingExperience && (
    <button
      className="btn mt-1"
      onClick={() => addnewExpEdu("Experience")}
    >
      <i className="fa-solid fa-circle-plus"></i> Add Experience
    </button>
  )}
</div>



<div className="mb-2">
  <label className="form-label text-dark h5 fw-bold">Education Details</label>

  <div className="row">
    {UpdateProfileData?.education?.length > 0 ? (
      UpdateProfileData.education.map((edu, index) => (
        <div key={index} className="card mb-3 shadow-sm border-0">
          <div className="card-body">
            {editingEduIndex === index ? (
              // ===== EDIT MODE =====
              <div>
                <div className="mb-2">
                  <label className="form-label">Institute</label>
                  <input
                    type="text"
                    className="form-control"
                    value={edu.institute}
                    onChange={(e) => {
                      const updated = [...UpdateProfileData.education];
                      updated[index].institute = e.target.value;
                      setUpdateProfileData({
                        ...UpdateProfileData,
                        education: updated,
                      });
                    }}
                  />
                </div>

                <div className="mb-2">
                  <label className="form-label">Course</label>
                  <input
                    type="text"
                    className="form-control"
                    value={edu.course}
                    onChange={(e) => {
                      const updated = [...UpdateProfileData.education];
                      updated[index].course = e.target.value;
                      setUpdateProfileData({
                        ...UpdateProfileData,
                        education: updated,
                      });
                    }}
                  />
                </div>

                <div className="mb-2">
                  <label className="form-label">Duration</label>
                  <input
                    type="text"
                    className="form-control"
                    value={edu.duration}
                    onChange={(e) => {
                      const updated = [...UpdateProfileData.education];
                      updated[index].duration = e.target.value;
                      setUpdateProfileData({
                        ...UpdateProfileData,
                        education: updated,
                      });
                    }}
                  />
                </div>

                <div className="mb-2">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-control"
                    value={edu.description}
                    onChange={(e) => {
                      const updated = [...UpdateProfileData.education];
                      updated[index].description = e.target.value;
                      setUpdateProfileData({
                        ...UpdateProfileData,
                        education: updated,
                      });
                    }}
                  />
                </div>

                <div className="d-flex justify-content-end gap-2">
                  <button
                    className="btn btn-sm btn-success"
                    onClick={() => saveEditEdu(index, edu)}
                  >
                    Save
                  </button>
                  <button
                    className="btn btn-sm btn-secondary"
                    onClick={() => setEditingEduIndex(null)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              // ===== VIEW MODE =====
              <div>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <div>
                    <h5 className="card-title mb-0 text-dark fw-bold">
                      {edu.institute}
                    </h5>
                    <small className="text-muted">{edu.course}</small>
                  </div>

                  <span
                    className="badge text-secondary px-3 py-2"
                    style={{ fontStyle: "italic" }}
                  >
                    {edu.duration}
                  </span>
                </div>

                {edu.description && (
                  <p className="card-text mt-2 text-muted">{edu.description}</p>
                )}

                <div className="d-flex justify-content-end gap-2 mt-2">
                  <button
                    className="btn btn-sm p-0 border-0 bg-transparent"
                    onClick={() => startEditEdu(index)}
                  >
                    <i className="fa-solid fa-pen text-secondary"></i>
                  </button>
                  <button
                    className="btn btn-sm p-0 border-0 bg-transparent"
                    onClick={() => DeleteEducation(index)}
                  >
                    <i className="fa-solid fa-trash text-secondary"></i>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ))
    ) : (
      <p className="text-muted">No education available.</p>
    )}

    {isAddingEducation && (
      <div className="card mb-3 shadow-sm border-0">
        <div className="card-body">
          <div className="mb-2">
            <label className="form-label">Institute</label>
            <input
              type="text"
              className="form-control"
              value={newEducation.institute}
              onChange={(e) =>
                setNewEducation({ ...newEducation, institute: e.target.value })
              }
            />
          </div>
          <div className="mb-2">
            <label className="form-label">Course</label>
            <input
              type="text"
              className="form-control"
              value={newEducation.course}
              onChange={(e) =>
                setNewEducation({ ...newEducation, course: e.target.value })
              }
            />
          </div>
          <div className="mb-2">
            <label className="form-label">Duration</label>
            <input
              type="text"
              className="form-control"
              value={newEducation.duration}
              onChange={(e) =>
                setNewEducation({ ...newEducation, duration: e.target.value })
              }
            />
          </div>
          <div className="mb-2">
            <label className="form-label">Description</label>
            <textarea
              className="form-control"
              value={newEducation.description}
              onChange={(e) =>
                setNewEducation({ ...newEducation, description: e.target.value })
              }
            />
          </div>
          <div className="d-flex justify-content-end gap-2">
            <button className="btn btn-sm btn-success" onClick={saveNewEducation}>
              Save
            </button>
            <button
              className="btn btn-sm btn-secondary"
              onClick={() => setisAddingEducation(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    )}
  </div>

  <button
    className="btn mt-3"
    onClick={() => addnewExpEdu("Education")}
  >
    <i className="fa-solid fa-circle-plus"></i> Add Education
  </button>
</div>

</div>
              <div className="modal-footer">
                <button className="btn btn-success" onClick={updateData}>
                  Update
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => setModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};