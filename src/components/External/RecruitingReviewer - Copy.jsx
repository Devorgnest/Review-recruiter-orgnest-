import React, { useState, useEffect } from 'react';
import './RecruitingReviewer.css'; 

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

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const [profilesResponse, reviewersResponse] = await Promise.all([
          fetch('http://localhost:5000/api/job-profiles'),
          fetch('http://localhost:5000/api/admin-reviewers')
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

    fetchProfiles();
  }, []);

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

  // const handleGenerate = (source, field) => {
  //   const text = source === 'internal'
  //     ? `Generated from Internal Sources`
  //     : `Generated from External Sources`;
  
  //   setEditBuffer(prev => ({
  //     ...prev,
  //     [field]: text
  //   }));
  // };

  const handleSave = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/job-profiles/update-recruiter-description', {
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
        alert('Changes saved successfully!');

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
      } else {
        alert('Failed to save changes.');
      }
    } catch (error) {
      console.error('Error saving changes:', error);
      alert('Error saving changes.');
    }
  };

  const handleApprove = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/job-profiles/approve-recruiter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
        profile: selectedProfile,
        recruiterReviewer: selectedRecruiterReviewer
        })
      });

      if (response.ok) {
        alert(`${selectedProfile} Approved!`);
        setProfilesData(prev => ({
          ...prev,
          [selectedProfile]: { ...prev[selectedProfile], recruiterApproved: true }
        }));
        setSelectedProfile('');
      } else {
        alert('Failed to approve profile.');
      }
    } catch (error) {
      console.error('Error approving profile:', error);
      alert('Error approving profile.');
    }
  };

  const filteredProfiles = Object.keys(profilesData).filter(profile => {
    const data = profilesData[profile];

    const isApproved = data.approved === true;
    const matchesApproval = approvalFilter === 'all'
      ? true
      : approvalFilter === 'approved'
        ? isApproved
        : !isApproved;

    return matchesApproval;
  });

  if (loading) {
    return <div>Loading profiles...</div>;
  }

  return (
    <div className="primary-review-container">
      <h2 className="page-heading">Recruiter Review</h2>

      <div className="dropdown-group">

      {showReviewerFields && (

      <>
        <div>
          <label>Primary Reviewer</label>
          <select value={selectedReviewer} disabled className="dropdown">
            {/* <option value="">View Only</option> */}
            {reviewersList.primaryReviewers.map(name => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
        </div>

        <div>
          <label>HR Reviewer</label>
          <select value={selectedHRReviewer} disabled className="dropdown">
            {/* <option value="">View Only</option> */}
            {reviewersList.hrReviewers.map(name => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
        </div>
        </>
        )}

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

        <div>
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
  const isRecruiterApproved = profilesData[profile]?.recruiterApproved;
  return (
    <option key={profile} value={profile}>
      {isRecruiterApproved ? `${profile}✅` : profile}
    </option>
  );
})}

          </select>
        </div>
      </div>
      {selectedProfile && (
        <div className="vertical-info-container">
  <div className="readonly-combined-box">
    <p><strong>Vertical:</strong> {vertical}</p>
    <p><strong>Division:</strong> {division}</p>
    <p><strong>Sub Division:</strong> {subdivision}</p>
  </div>
  </div>
)}

      {selectedProfile && (
        <>
          <div className="job-description-header">
            <h3>Job Description</h3>
            <div className="edit-button-wrapper">
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
                <p>{formState[key]}</p>
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
        </>
      )}
    </div>
  );
};

export default RecruitingReviewerPage;
