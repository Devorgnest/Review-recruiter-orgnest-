import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import './RecruitingReviewer.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


const RecruitingReviewerPage = () => {
  const [profilesData, setProfilesData] = useState({});
  const [loading, setLoading] = useState(true);
  const [reviewersList, setReviewersList] = useState({
    primaryReviewers: [],
    hrReviewers: [],
    recruiterReviewers: []
  });
const [vertical, setVertical] = useState('');
const [division, setDivision] = useState('');
const [subdivision, setSubdivision] = useState('');

  const [selectedRecruiterReviewer, setSelectedRecruiterReviewer] = useState('');
  const [selectedReviewer, setSelectedReviewer] = useState('');
  const [selectedHRReviewer, setSelectedHRReviewer] = useState('');
  const [approvalFilter, setApprovalFilter] = useState('all');
  const [selectedProfile, setSelectedProfile] = useState('');
  const [showReviewerFields, setShowReviewerFields] = useState(false);

  const [formState, setFormState] = useState({
    whatYoullDo: '',
    whatWeLookFor: '',
    qualitiesThatStir: ''
  });

  const [editBuffer, setEditBuffer] = useState({
    whatYoullDo: '',
    whatWeLookFor: '',
    qualitiesThatStir: ''
  });

  const [sectionEditable, setSectionEditable] = useState({
    whatYoullDo: false,
    whatWeLookFor: false,
    qualitiesThatStir: false
  });

  const [mainEditable, setMainEditable] = useState(false);

  const fetchProfiles = async () => {
    try {
      const [profilesResponse, reviewersResponse] = await Promise.all([
        fetch('http://18.224.60.64:5000/api/external/all-job-profiles'),
        fetch('http://18.224.60.64:5000/api/recuriter_reviewers-list')
      ]);

      const profilesData = await profilesResponse.json();
      const reviewersData = await reviewersResponse.json();

      setProfilesData(profilesData);
      setReviewersList({
        primaryReviewers: reviewersData.primaryReviewers,
        hrReviewers: reviewersData.hrReviewers,
        recruiterReviewers: reviewersData.recruiterReviewers
      });
      setLoading(false);
    } catch (error) {
      console.error('Error fetching profiles:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    
    fetchProfiles();
  }, [selectedRecruiterReviewer]);

  const handleProfileSelect = (profile) => {
    // const descData = profilesData[profile].description;
    const profileData = profilesData[profile];
  const descData = profileData.description;

  const newState = {
    whatYoullDo: descData.whatYoullDo || descData.purpose || '',
    whatWeLookFor: descData.whatWeLookFor || descData.responsibilities || '',
    qualitiesThatStir: descData.qualitiesThatStir || descData.competencies || ''
  };

    setFormState(newState);

    setSelectedReviewer(profileData.primaryReviewer || '');
    setSelectedHRReviewer(profileData.hrReviewer || '');

    setVertical(profileData.vertical || '');
    setDivision(profileData.division || '');
    setSubdivision(profileData.subdivision || '');

    setSelectedProfile(profile);
    setMainEditable(false);
    setSectionEditable({ whatYoullDo: false, whatWeLookFor: false, qualitiesThatStir: false });
  };

  const toggleSectionEdit = (section) => {
    if (sectionEditable[section]) {
     
      setEditBuffer(prev => ({
        ...prev,
        [section]: formState[section] 
      }));
    }
    
    
    setSectionEditable(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };



  const handleSave = async () => {
    try {
      const response = await fetch('http://18.224.60.64:5000/api/external-review/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile: selectedProfile,
          recruiterReviewer: selectedRecruiterReviewer,
          updatedRecruiterDescription: {
            whatYoullDo: editBuffer.whatYoullDo,
            whatWeLookFor: editBuffer.whatWeLookFor,
            qualitiesThatStir: editBuffer.qualitiesThatStir
          }
        })
      });

      if (response.ok) {

        setFormState({ ...editBuffer });

        setProfilesData(prev => ({
          ...prev,
          [selectedProfile]: {
            ...prev[selectedProfile],
            description: {
              ...prev[selectedProfile].description,
              whatYoullDo: editBuffer.whatYoullDo,
              whatWeLookFor: editBuffer.whatWeLookFor,
              qualitiesThatStir: editBuffer.qualitiesThatStir
            }
          }
        }));

        
        setMainEditable(false);
        setSectionEditable({ 
          whatYoullDo: false, 
          whatWeLookFor: false, 
          qualitiesThatStir: false
         });

         await fetchProfiles();
        //  alert('Changes saved successfully!');
         toast.success("Changes saved successfully!");


      } else {
        // alert('Failed to save changes.');
        toast.error("Failed to save changes.");
      }
    } catch (error) {
      console.error('Error saving changes:', error);
      // alert('Error saving changes.');
              toast.error("Failed to save changes.");

    }
  };

  const handleApprove = async () => {
    try {
      const response = await fetch('http://18.224.60.64:5000/api/external-review/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
        profile: selectedProfile,
        recruiterReviewer: selectedRecruiterReviewer,
        updatedRecruiterDescription: {
          whatYoullDo: editBuffer.whatYoullDo,
          whatWeLookFor: editBuffer.whatWeLookFor,
          qualitiesThatStir: editBuffer.qualitiesThatStir,
          'approved_external' : 'yes'
        },
        })
      });

      if (response.ok) {
        setProfilesData(prev => ({
          ...prev,
          [selectedProfile]: { ...prev[selectedProfile], recruiterApproved: true }
        }));
        setSelectedProfile('');

        await fetchProfiles();

        // alert('Changes approved successfully!');
        toast.success("Changes approved successfully!");

      } else {
        // alert('Failed to approve profile.');
        toast.error("Failed to approve changes.");

      }
    } catch (error) {
      console.error('Error approving profile:', error);
      // alert('Error approving profile.');
      toast.error("Failed to approve changes.");

      
    }
  };

  const filteredProfiles = Object.keys(profilesData).filter(profile => {
    const data = profilesData[profile];

    console.log(data)
    console.log(selectedRecruiterReviewer)

    const matchesPrimary = selectedRecruiterReviewer ? data.primaryReviewer === selectedRecruiterReviewer : false;

    const isApproved = data.approved_external === 'yes';
    const matchesApproval = approvalFilter === 'all'
      ? true
      : approvalFilter === 'approved'
        ? isApproved
        : !isApproved;

    return matchesPrimary && matchesApproval;
  });



function getLabel(profile) {
  const isRecruiterApproved = profilesData[profile]?.approved_external;
  return isRecruiterApproved ? `${profile} ✅` : profile;
}



  if (loading) {
    return <div>Loading profiles...</div>;
  }

  return (






<div className="external-page-wrapper">
  {/* Header */}
  <header className="external-header">
    <img src='./Header.jpg' alt="Header" className="header-photo" />
  </header>














    <div className="external-review-container">
      <h2 className="page-heading">Recruiter Review</h2>

      <div className="combined-dropdown-group">

      <div className="dropdown-group">

      {/* {selectedProfile && (
        <div className="readonly-reviewer-info">
          <p><strong>Primary Reviewer:</strong> {selectedReviewer}</p>
          <p><strong>HR Reviewer:</strong> {selectedHRReviewer}</p>
          <p><strong>Hiring Manager:</strong> {profilesData[selectedProfile]?.hiringManager || 'N/A'}</p>
        </div>
      )} */}
      
        <div>
          <label>Recruiter Reviewer</label>
          <select
            value={selectedRecruiterReviewer}
            onChange={(e) => setSelectedRecruiterReviewer(e.target.value)}
            className="dropdown"
          >
            <option value="">Select Recruiter Reviewer</option>
            {reviewersList.recruiterReviewers.map(name => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
        </div>

        <div>
          <label>Approval Status</label>
          <select
            value={approvalFilter}
            onChange={(e) => { setApprovalFilter(e.target.value); setSelectedProfile(''); }}
            className="dropdown"
          >
            <option value="all">All Profiles</option>
            <option value="approved">Approved</option>
            <option value="unapproved">Unapproved</option>
          </select>
        </div>
        </div>

        {/* <div className="profile-dropdown">
          <label>Job Profile</label>
          <select
            value={selectedProfile}
            onChange={(e) => {
              handleProfileSelect(e.target.value);
              setShowReviewerFields(true);
            }}
            className="dropdown"
          >
            <option value="">Select Job Profile</option>
            {filteredProfiles.map(profile => {
              const isRecruiterApproved = profilesData[profile]?.approved_external;
              return (
                <option key={profile} value={profile}>
                  {isRecruiterApproved ? `${profile}✅` : profile}
                </option>
              );
            })}

          </select>
        </div> */}

        <div className= "dropdown-group-2">
<div className="profile-dropdown">
  <label>Job Profile</label>
  <Select
    className="react-select-container"
    classNamePrefix="react-select"
    value={selectedProfile ? { value: selectedProfile, label: getLabel(selectedProfile) } : null}
    onChange={(selectedOption) => {
      handleProfileSelect(selectedOption.value);
      setShowReviewerFields(true);
    }}
    options={filteredProfiles.map(profile => {
      const isRecruiterApproved = profilesData[profile]?.approved_external;
      return {
        value: profile,
        label: isRecruiterApproved ? `${profile} ✅` : profile
      };
    })}
    placeholder="Select Job Profile"
    isSearchable
  />
</div>
</div>
</div>
      

      {selectedProfile && (
        
        <div className="readonly-combined-box">
        
          <p><strong>Primary Reviewer:</strong> {selectedReviewer}</p>
          <p><strong>HR Reviewer:</strong> {selectedHRReviewer}</p>
          <p><strong>Hiring Manager:</strong> {profilesData[selectedProfile]?.hiringManager || 'N/A'}</p>
        </div>
        

      )}

      {selectedProfile && (
        
        <div className="readonly-combined-box">
          <p><strong>Vertical:</strong> {vertical}</p>
          <p><strong>Division:</strong> {division}</p>
          <p><strong>Sub Division:</strong> {subdivision}</p>
        </div>
        
      )}

      {selectedProfile && (
        <>
          <div className="job-description-header">
            <h3>Job Description</h3>
            <div className="edit-button-container">
              <button
                className="edit-button"
                onClick={() => {
                  const newMainEditable = !mainEditable;
                  setMainEditable(newMainEditable);

                  if (newMainEditable) {

                    setEditBuffer({ ...formState }); 
                  }

                  
                  const updatedSections = {};
                  Object.keys(sectionEditable).forEach(section => {
                    updatedSections[section] = newMainEditable;
                  });
                  setSectionEditable(updatedSections);
                }}
              >
                {mainEditable ? 'Cancel Edit' : 'Edit'}
              </button>
            </div>
          </div>

          {[
            { key: "whatYoullDo", label: "What You'll Do" },
            { key: "whatWeLookFor", label: "What We Look For" },
            { key: "qualitiesThatStir", label: "Qualities that Stir Our Souls (and make you stand out)" }
          ].map(({ key, label }) => (
            <div key={key} className="description-section">
              <div className="section-header">
                <h4>{label}</h4>
                {mainEditable && (
                  <button className="section-edit-button" onClick={() => toggleSectionEdit(key)}>
                    {sectionEditable[key] ? 'Cancel' : 'Edit'}
                  </button>
                )}
              </div>

              {!sectionEditable[key] ? (
                <p>
                {formState[key]?.split('\n').map((line, index) => (
                  <React.Fragment key={index}>
                    {line}
                    <br />
                  </React.Fragment>
                ))}
              </p>
              ) : (
                <>
                <textarea
                  value={editBuffer[key]}
                  onChange={(e) => setEditBuffer(prev => ({ ...prev, [key]: e.target.value }))}
                  rows={4}
                  className="editable-textarea"
                />
                {/* <div className="generate-btn-group">
                    <button onClick={() => handleGenerate('internal', key)}>
                      Generate from Internal Sources
                    </button>
                    <button onClick={() => handleGenerate('external', key)}>
                      Generate from External Sources
                    </button>
                  </div> */}
                </>
              )}
            </div>
          ))}

{mainEditable && (
            <div style={{ marginTop: '20px' }}>
              <button className="save-button" onClick={handleSave}>Save Changes</button>
            </div>
          )}

{selectedProfile && (
            <div className="approve-button-container">
              <button className="approve-button" onClick={handleApprove}>
                Approve
              </button>
            </div>
          )}

<h3 className="internal-heading" style={{ marginTop: '30px' }}>Internal</h3>

{[
  { key: 'purpose', label: 'Position Purpose' },
  { key: 'responsibilities', label: 'Key Responsibilities' },
  { key: 'manager', label: 'Direct Manager/Direct Reports' },
  { key: 'travel', label: 'Travel Requirements' },
  { key: 'physical', label: 'Physical Requirements' },
  { key: 'workconditions', label: 'Working Conditions' },
  { key: 'minqualifications', label: 'Minimum Qualifications' },
  { key: 'preferredqualifications', label: 'Preferred Qualifications' },
  { key: 'mineducation', label: 'Minimum Education' },
  { key: 'preferrededucation', label: 'Preferred Education' },
  { key: 'minexperience', label: 'Minimum Experience' },
  { key: 'certifications', label: 'Certifications' },
  { key: 'competencies', label: 'Competencies' }
].map(({ key, label }) => (
  <div key={key} className="description-section">
    <div className="section-header">
      <h4>{label}</h4>
    </div>
    <p>
  {profilesData[selectedProfile]?.description?.[key]
    ?.split('\n')
    .map((line, index) => (
      <React.Fragment key={index}>
        {line}
        <br />
      </React.Fragment>
  ))}
</p>
  </div>
))}


          

          
        </>
      )}
    </div>






    <ToastContainer position="top-center" autoClose={3000} hideProgressBar />


    <footer className="external-footer">
    <img src="./orgnest_logo.png" alt="Company Logo" className="footer-logo" />
    <p>© 2025 OrgNest. All rights reserved. <a href="/privacy">Privacy Policy</a></p>
  </footer>
</div>















  );
};

export default RecruitingReviewerPage;
