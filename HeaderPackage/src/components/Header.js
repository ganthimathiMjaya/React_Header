import React, { useEffect, useMemo, useState } from "react";
import { SelectBox, Button } from "devextreme-react";
import "devextreme/dist/css/dx.light.css";
import "../styles/common_header.css";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
// import { mainMenuCheck } from "configure-iamdatabinder";
import { mainMenuCheck } from "new-iamdatabinder";
// import Bowser from "bowser";
import moment from "moment";

const Header = ({
  token,
  workspace,
  projectName,
  onCustomerChange,
  isClockEnable,
  onUserInfoFetched,
  onWorkspaceChange,
  isWorkspace,
  baseURL,
  homeURL,
  onUserRoleChange,
  appId,
  orgId,
  onSubClientIdChange,
  knolApiBaseUrl,
}) => {
  const [userRoles, setUserRoles] = useState([]);

  const [userInfo, setUserInfo] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedRoles, setSelectedRoles] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [SubClientId, setSubClientId] = useState(null);
  const [subclientOptions, setSubclientOptions] = useState([]);
  const [showSubclientField, setShowSubclientField] = useState(false);
  const [currentDateTime, setCurrentDateTime] = useState({
    dateStr: "",
    times: [], // Initialize times as an empty array
  });
  const decodedToken = jwtDecode(token);
  const userId = decodedToken.UserId;

  //   const logExtendedUserDetails = () => {
  //     const browser = Bowser.getParser(window.navigator.userAgent);
  //     const browserInfo = browser.getBrowser();
  //     const osInfo = browser.getOS();
  //     const platformInfo = browser.getPlatform();

  //     const userDetails = {
  //         browserName: browserInfo.name,
  //         browserVersion: browserInfo.version,
  //         osName: osInfo.name,
  //         osVersion: osInfo.version,
  //         platformType: platformInfo.type,
  //         screenResolution: `${window.screen.width}x${window.screen.height}`,
  //         language: navigator.language,
  //         timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  //         dateTime: new Date().toISOString(),
  //         userAgent: navigator.userAgent,
  //         onlineStatus: navigator.onLine,
  //         cookiesEnabled: navigator.cookieEnabled,
  //         deviceMemory: navigator.deviceMemory || "Unknown",
  //         hardwareConcurrency: navigator.hardwareConcurrency || "Unknown",
  //         touchSupport: 'ontouchstart' in window,
  //         currentUrl: window.location.href,
  //         referrer: document.referrer,
  //         colorDepth: screen.colorDepth,
  //         pixelDepth: screen.pixelDepth
  //     };

  //     console.log("Full User Details:", userDetails);
  // };
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await axios.get(
          `${baseURL}/IAM/GetUserInfoById?userId=${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`, // Pass the token here
            },
          }
        );
        setUserInfo(response?.data?.Data);
        // Pass the fetched user info to the parent component
        if (onUserInfoFetched) {
          onUserInfoFetched(response?.data?.Data);
        }
      } catch (err) {
        console.error("Error fetching user info:", err);
      }
    };

    fetchUserInfo();
  }, [token]);

  useEffect(() => {
    const fetchPermisionAccess = async () => {
      if (workspace) {
        try {
          const response = await mainMenuCheck(
            `${userId}`,
            `${orgId}`,
            `${token}`,
            `${appId}`,
            `${workspace}`,
            `${baseURL}`
          );

          const allOrgApps = response?.OrgDetails?.[0]?.AppDetails || [];

          // Find app matching the current appId prop
          const filteredApp = response?.OrgDetails?.[0];
          const appDetails = filteredApp?.AppDetails?.find(
            (detail) => detail.AppId === appId
          );
          if (appDetails) {
            const userRoles = appDetails.UserRole || [];

            setUserRoles(userRoles);
            setSelectedRoles(userRoles[0]?.Id || null);
          }
        } catch (error) {
          console.error("Error fetching permission data:", error);
        }
      }
    };

    fetchPermisionAccess();
  }, [workspace]);

  // useEffect(() => {
  //     const fetchUserRoles = async () => {
  //         try {
  //             const res = await fetch(`${baseURL}/IAM/GetUserRolesByUserId?UserId=${userId}`, {
  //                 headers: {
  //                     Authorization: `Bearer ${token}`,
  //                 }
  //             });
  //             const json = await res.json();

  //             if (json?.Success && json?.Data?.UserRole) {
  //               setUserRoles(json.Data.UserRole);
  //               setSelectedRoles(json.Data.UserRole[0]?.RoleId || null);

  //             }

  //         } catch (error) {
  //             console.error("Error fetching user roles:", error);
  //         }
  //     };

  //     fetchUserRoles();
  // }, []);

  const handleRoleChange = (e) => {
    const newRoleId = e.value;
    setSelectedRoles(newRoleId);

    if (onUserRoleChange) {
      onUserRoleChange(newRoleId);
    }
  };

  const openOrFocusWindow = () => {
    const win = window.open(homeURL, "MyUniqueWindowName"); // name is important
    if (win) {
      win.focus();
    }
  };
  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      setCurrentDateTime(formatDateTime(now));
    };
    const intervalId = setInterval(updateDateTime, 1000);
    updateDateTime(); // Initial call

    return () => clearInterval(intervalId); // Cleanup on unmount
  }, []);

  useEffect(() => {
    const fetchCustomerProjects = async () => {
      try {
        const response = await axios.get(
          `${baseURL}/User/v1/GetUserCustomerProjectMapping`,
          {
            params: {
              UserId: userId,
              OrgId: `${orgId}`,
              AppId: `${appId}`
            },
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const customerData = response?.data?.Data?.CustomerList || [];
        setCustomers(customerData);

        // Automatically select the default customer
        const defaultCustomer =
          customerData.find((c) => c?.IsDefault) || customerData[0];
        if (defaultCustomer && projectName !== "claimpathway") {
          setSelectedCustomer(defaultCustomer?.CustomerId);
          onCustomerChange && onCustomerChange(defaultCustomer?.CustomerId);
          const customerProjects = defaultCustomer?.ProjectList || [];
          setProjects(customerProjects);
          let defaultProject = null;

          if (customerProjects.length > 0) {
            defaultProject =
              customerProjects.find((project) => project?.IsDefault) ||
              customerProjects[0];

            if (defaultProject) {
              setSelectedProject(defaultProject?.ProjectId);
              // Delay onWorkspaceChange until it's not null
              onWorkspaceChange && onWorkspaceChange(defaultProject?.ProjectId);
            }
          } // Call API only if CustomerId is available
          if (defaultCustomer?.CustomerId && defaultProject?.ProjectId) {
            await updateCustomerProjectMapping(
              defaultCustomer?.CustomerId,
              defaultProject?.ProjectId
            );
            await subclientDropvalue(
              defaultCustomer?.CustomerId,
              defaultProject?.ProjectId,
              true
            );
          }
        }
      } catch (err) {
        console.error("Error fetching customer projects:", err);
      }
    };

    fetchCustomerProjects();
  }, [userId, token]); // Add `onWorkspaceChange` to dependencies

  const handleCustomerChange = async (e) => {
    if (!e.value) {
      return;
    }

    setSelectedCustomer(e.value);
    const selectedCustomerData = customers.find(
      (c) => c.CustomerId === e.value
    );
    if (!selectedCustomerData) {
      return;
    }

    const customerProjects = selectedCustomerData?.ProjectList || [];
    setProjects(customerProjects); // Update projects
    onCustomerChange && onCustomerChange(e.value); // Notify parent if prop exists

    if (customerProjects.length > 0) {
      const defaultProject =
        customerProjects.find((p) => p?.IsDefault) || customerProjects[0];
      setSelectedProject(defaultProject?.ProjectId || null);
      const projectId = defaultProject?.ProjectId || null;
      onWorkspaceChange && onWorkspaceChange(projectId);
      // Call the API only when both customerId and projectId are available
      if (e.value && projectId) {
        await updateCustomerProjectMapping(e.value, projectId);
        await subclientDropvalue(e.value, projectId);
      }
    }
  };

  const formatDateTime = (date) => {
    const optionsDate = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    const dateStr = date.toLocaleDateString(undefined, optionsDate); // e.g., "Monday, September 30"

    // Get time in various formats
    const optionsTime = { timeStyle: "short", hour12: false }; // 24-hour format
    const times = [
      {
        label: "HST",
        time: date.toLocaleString("en-US", {
          ...optionsTime,
          timeZone: "Pacific/Honolulu",
        }),
      },
      // { label: 'PHST', time: date.toLocaleString('en-US', { ...optionsTime, timeZone: 'Asia/Manila' }) },
      {
        label: "PST",
        time: date.toLocaleString("en-US", {
          ...optionsTime,
          timeZone: "America/Los_Angeles",
        }),
      },
      {
        label: "MST",
        time: date.toLocaleString("en-US", {
          ...optionsTime,
          timeZone: "America/Denver",
        }),
      },
      {
        label: "CST",
        time: date.toLocaleString("en-US", {
          ...optionsTime,
          timeZone: "America/Chicago",
        }),
      },
      {
        label: "EST",
        time: date.toLocaleString("en-US", {
          ...optionsTime,
          timeZone: "America/New_York",
        }),
      },
      {
        label: "IST",
        time: date.toLocaleString("en-US", {
          ...optionsTime,
          timeZone: "Asia/Kolkata",
        }),
      },
    ];
    return { dateStr, times };
  };

  const handleWorkspaceChange = async (e) => {
    const matchedCustomer = customers.find((customer) =>
      customer.ProjectList?.some((project) => project.ProjectId === e.value)
    );

    const customerId = matchedCustomer?.CustomerId ?? selectedCustomer;

    await updateCustomerProjectMapping(customerId, e.value);
    await subclientDropvalue(customerId, e.value);

    // const requestData = {
    //     CustomerId: selectedCustomer,
    //     ProjectId: e.value,
    //     UserId: userId,
    //     Time: new Date().toISOString().replace("T", " ").split(".")[0] + ".000"
    // };

    // try {
    //     const response = await axios.post(
    //         `${baseURL}/User/UpdateUserCustomerProjectMapping`,
    //         requestData,
    //         {
    //             headers: {
    //                 Authorization: token,
    //                 "Content-Type": "application/json"
    //             }
    //         }
    //     );

    // } catch (error) {
    //     console.error("Error updating mapping:", error.response?.data || error.message);
    // }
  };

  const updateCustomerProjectMapping = async (customerId, projectId) => {
    if (!customerId || !projectId) {
      return;
    }
    // logExtendedUserDetails();
    const requestData = {
      CustomerId: customerId,
      ProjectId: projectId,
      // OrgId: '9ba8241f-ab2c-4c1b-98be-81a97b165f00',
      OrgId: `${orgId}`,
      AppId: `${appId}`,
      UserId: userId,
      Time: moment().format('YYYY-MM-DD HH:mm:ss') + '.000'
    };

    try {
      await axios.post(
        `${baseURL}/User/v1/UpdateUserCustomerProjectMapping`,
        requestData,
        {
          headers: {
            Authorization: token,
            "Content-Type": "application/json",
          },
        }
      );
    } catch (error) {
      console.error(
        "Error updating mapping:",
        error.response?.data || error.message
      );
    }
  };

  // const subclientDropvalue = async (customerId, projectId, shouldSetDefault = false) => {
  //   if (!customerId || !projectId) return;
  //   try {
  //     const subclientResponse = await axios.get(`${knolApiBaseUrl}/NewKNOLGetContractClientID`, {
  //       params: {
  //         CustomerID: customerId,
  //         KnolProjectID: projectId,
  //       },
  //     });

  //      const availableSubclients = subclientResponse.data || [];

  //     //  setShowSubclientField(availableSubclients.length > 0);
  //     if (availableSubclients.length > 0) {
  //       setShowSubclientField(true);
  //       const userServiceResponse = await axios.get(
  //         `${knolApiBaseUrl}/NewKNOLGetUserServiceDetails`,
  //         {
  //           params: {
  //             CustomerID: customerId,
  //             KnolProjectID: projectId,
  //             UserID: userId,
  //           },
  //         }
  //       );

  //        const userAllowedSubclients = userServiceResponse.data || [];

  //       const allowedSubclientIds = userAllowedSubclients.map(
  //         (item) => item.ContractClientId
  //       );

  //       const matchedSubclients = availableSubclients.filter((subclient) =>
  //         allowedSubclientIds.includes(subclient.ContractSubclientId)
  //       );

  //       const finalDropdownOptions =
  //         matchedSubclients.length > 0 ? matchedSubclients : availableSubclients;

  //       setSubclientOptions(finalDropdownOptions);

  //         //  console.log(finalDropdownOptions,"validate");

  //       // if (shouldSetDefault && finalDropdownOptions.length > 0) {
  //       //   setSubClientId(finalDropdownOptions[0].ContractSubclientId);
  //       // }
  //       setSubClientId(finalDropdownOptions?.[0]?.ContractSubclientId);
  //        onSubClientIdChange && onSubClientIdChange(finalDropdownOptions?.[0]?.ContractSubclientId)
  //     } else {
  //       setShowSubclientField(false);
  //       setSubClientId(0);
  //       setSubclientOptions([])
  //       onSubClientIdChange && onSubClientIdChange(0)
  //     }
  //   } catch (error) {
  //     console.error("Error fetching subclient dropdown data:", error);
  //   }
  // };
  const subclientDropvalue = async (
    customerId,
    projectId,
    shouldSetDefault = false
  ) => {
    if (!customerId || !projectId) return;

    try {
      const response = await axios.get(`${baseURL}/User/GetUserSubclients`,
        {
          params: {
            customerId,
            projectId,
            userId,
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const subclients = response.data?.Data || [];

      if (subclients.length === 0) {
        setShowSubclientField(false);
        setSubClientId(0);
        setSubclientOptions([]);
        onSubClientIdChange && onSubClientIdChange(0);
        return;
      }

      setShowSubclientField(true);
      setSubclientOptions(subclients);

      const defaultId = subclients[0].SubclientId;
      setSubClientId(defaultId);
      onSubClientIdChange && onSubClientIdChange(defaultId);
    } catch (error) {
      console.error("Error fetching subclient dropdown data:", error);
      setShowSubclientField(false);
      setSubClientId(0);
      setSubclientOptions([]);
      onSubClientIdChange && onSubClientIdChange(0);
    }
  };
  // const subclientDropvalue = async (customerId, projectId, shouldSetDefault = false) => {
  //   if (!customerId || !projectId) return;

  //   try {
  //     const subclientResponse = await axios.get(`${knolApiBaseUrl}/NewKNOLGetContractClientID`, {
  //       params: {
  //         CustomerID: customerId,
  //         KnolProjectID: projectId,
  //       },
  //     });

  //     const availableSubclients = subclientResponse.data || [];
  //         if (availableSubclients.length === 0) {
  //       setShowSubclientField(false);
  //       setSubClientId(0);
  //       setSubclientOptions([]);
  //       onSubClientIdChange && onSubClientIdChange(0);
  //       return;
  //     }
  //         const userServiceResponse = await axios.get(`${knolApiBaseUrl}/NewKNOLGetUserServiceDetails`, {
  //       params: {
  //         CustomerID: customerId,
  //         KnolProjectID: projectId,
  //         UserID: userId,
  //       },
  //     });

  //     const userAllowedSubclients = userServiceResponse.data || [];
  //         if (userAllowedSubclients.length === 0) {
  //       setShowSubclientField(false);
  //       setSubClientId(0);
  //       setSubclientOptions([]);
  //       onSubClientIdChange && onSubClientIdChange(0);
  //       return;
  //     }
  //         const allowedSubclientIds = userAllowedSubclients.map(item => item.ContractClientId);

  //     const matchedSubclients = availableSubclients.filter(subclient =>
  //       allowedSubclientIds.includes(subclient.ContractSubclientId)
  //     );

  //     if (matchedSubclients.length > 0) {
  //       setShowSubclientField(true);
  //       setSubclientOptions(matchedSubclients);

  //       const defaultId = matchedSubclients[0].ContractSubclientId;
  //       setSubClientId(defaultId);
  //       onSubClientIdChange && onSubClientIdChange(defaultId);
  //     } else {
  //       setShowSubclientField(false);
  //       setSubClientId(0);
  //       setSubclientOptions([]);
  //       onSubClientIdChange && onSubClientIdChange(0);
  //     }
  //   } catch (error) {
  //     console.error("Error fetching subclient dropdown data:", error);
  //     setShowSubclientField(false);
  //     setSubClientId(0);
  //     setSubclientOptions([]);
  //     onSubClientIdChange && onSubClientIdChange(0);
  //   }
  // };
  const customerOptions = useMemo(() => {
  return customers.map((c) => ({
    value: c.CustomerId,
    label: c.CustomerName,
  }));
}, [customers]);

const projectOptions = useMemo(() => {
  return projects.map((p) => ({
    value: p.ProjectId,
    label: p.ProjectName,
  }));
}, [projects]);

const subclientOptionsMemo = useMemo(() => {
  return subclientOptions.map((p) => ({
    value: p.SubclientId,
    label: p.SubclientName,
  }));
}, [subclientOptions]);
  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "7px 3px",
        borderBottom: "2px solid #d3d3d3",
        borderBottom: projectName === "claimpathway" ? "none" : "2px solid #d3d3d3",
        background: "#f3f3f3",
      }}
    >

      {
        projectName === "knol" ? (
          <img
            src="data:image/png;base64,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Y0hSTQAAeiYAAICEAAD6AAAAgOgAAHUwAADqYAAAOpgAABdwnLpRPAAAAAlwSFlzAAAuIwAALiMBeKU/dgAABO5pVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDkuMS1jMDAyIDc5LmE2YTYzOTYsIDIwMjQvMDMvMTItMDc6NDg6MjMgICAgICAgICI+IDxyZGY6UkRGIHhtbG5zOnJkZj0iaHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyI+IDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PSIiIHhtbG5zOnhtcD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLyIgeG1sbnM6ZGM9Imh0dHA6Ly9wdXJsLm9yZy9kYy9lbGVtZW50cy8xLjEvIiB4bWxuczpwaG90b3Nob3A9Imh0dHA6Ly9ucy5hZG9iZS5jb20vcGhvdG9zaG9wLzEuMC8iIHhtbG5zOnhtcE1NPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vIiB4bWxuczpzdEV2dD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL3NUeXBlL1Jlc291cmNlRXZlbnQjIiB4bXA6Q3JlYXRvclRvb2w9IkFkb2JlIFBob3Rvc2hvcCAyNS45IChXaW5kb3dzKSIgeG1wOkNyZWF0ZURhdGU9IjIwMjQtMDgtMTJUMTI6Mzg6MzYrMDU6MzAiIHhtcDpNb2RpZnlEYXRlPSIyMDI0LTA4LTEyVDEyOjQwOjU3KzA1OjMwIiB4bXA6TWV0YWRhdGFEYXRlPSIyMDI0LTA4LTEyVDEyOjQwOjU3KzA1OjMwIiBkYzpmb3JtYXQ9ImltYWdlL3BuZyIgcGhvdG9zaG9wOkNvbG9yTW9kZT0iMyIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDo0YTUyOThhZi1hMWNiLWIyNDctOGVhMS1mMDNmMGE1ZjViYzciIHhtcE1NOkRvY3Vt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"
            alt="Logo"
            style={{ width: "120px", fontSize: "20px", marginLeft: "22px" }}
            onClick={() => openOrFocusWindow()}
          />
        ) : projectName === "claimpathway" ? (
          <img
            src="data:image/png;base64,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"
            alt="ClaimPathway Logo"
            style={{ width: "58px", fontSize: "20px", marginLeft: "22px" }}
            onClick={() => openOrFocusWindow()}
          />
        ) : (
          <img
          src="data:image/png;base64,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"
          alt="Logo"
          style={{ width: "141px", fontSize: "20px", marginLeft: "22px" }}
          onClick={() => openOrFocusWindow()}
        />
        )
      }

      <div
        style={{
          display: "flex",
          alignItems: "center",
          marginRight: "1rem",
          gap: "10px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginRight: "1rem",
            gap: "10px",
          }}
        >
          {isWorkspace && (
            <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
              <div>
                <div
                  style={{ textAlign: "start" }}
                  className="select_Headervalue"
                >
                  Customer
                </div>
                <SelectBox
                  value={selectedCustomer}
                  onValueChanged={handleCustomerChange}
                  dataSource={customerOptions}
                  displayExpr="label"
                  valueExpr="value"
                  placeholder="Select Customer"
                  style={{
                    minWidth: "200px",
                    marginRight: "1rem",
                  }}
                  searchEnabled={true}
                  searchExpr="label"
                />
              </div>
              <div>
                <div
                  style={{ textAlign: "start" }}
                  className="select_Headervalue"
                >
                  Project
                </div>
                <SelectBox
                  value={selectedProject}
                  onValueChanged={(e) => {
                    setSelectedProject(e.value);
                    onWorkspaceChange(e.value);
                    handleWorkspaceChange(e);
                  }}
                  dataSource={projectOptions}
                  displayExpr="label"
                  valueExpr="value"
                  placeholder="Select Project"
                  searchEnabled={true}
                  searchExpr="label"
                  style={{
                    minWidth: "200px",
                  }}
                />
              </div>
              {appId === "37fa0500-335d-46bd-b079-4546ce9a7532" &&
                showSubclientField && (
                  <div>
                    <div
                      style={{ textAlign: "start" }}
                      className="select_Headervalue"
                    >
                      SubClient
                    </div>
                    <SelectBox
                      value={SubClientId}
                      onValueChanged={(e) => {
                        // setSelectedProject(e.value);
                        // onWorkspaceChange(e.value);
                        // handleWorkspaceChange(e);
                        setSubClientId(e.value);
                        onSubClientIdChange(e.value);
                      }}
                      // dataSource={subclientOptions.map((p) => ({
                      //   value: p.ContractSubclientId,
                      //   label: p.ClientName,
                      // }))}
                      dataSource={subclientOptionsMemo}
                      displayExpr="label"
                      valueExpr="value"
                      placeholder="Select SubClient"
                      searchEnabled={true}
                      searchExpr="label"
                      style={{
                        minWidth: "200px",
                      }}
                    />
                  </div>
                )}
            </div>
          )}
          {projectName !== "claimpathway" && isClockEnable && (
            <>
              {/* <div>
                                <span style={{ fontSize: "12px" }}>{currentDateTime.dateStr}</span>
                            </div> */}
              <div className="infotimer">
                <ul className="listpanel">
                  {currentDateTime.times.map((timeObj, index) => (
                    <li key={index}>
                      <span>{timeObj.label}</span>
                      <h6 style={{ fontWeight: "bold" }}>{timeObj.time}</h6>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </div>
        <div>
          <span
            style={{
              fontSize: "12px",
              fontFamily: "arial",
              display: "block",
              paddingBottom: "6px",
              marginTop: projectName === "claimpathway" ? "0px" : "-13px",
            }}
          >
            {userInfo?.Name}
          </span>
          {projectName !== "claimpathway" && userRoles.length > 1 && (
            <div
              style={{
                top: "40px",
                right: 0,
                backgroundColor: "#fff",
                boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
                borderRadius: "8px",
                overflow: "hidden",
                zIndex: 999,
                minWidth: "180px",
              }}
            >
              <SelectBox
                value={selectedRoles}
                onValueChanged={handleRoleChange}
                dataSource={userRoles.map((c) => ({
                  value: c.Id,
                  label: c.RoleName,
                }))}
                displayExpr="label"
                valueExpr="value"
                placeholder="Switch Role"
                style={{
                  minWidth: "177px",
                  height: "34px",
                }}
              />
            </div>
          )}
        </div>
        <div
          style={{
            width: "39px",
            height: "32px",
            borderRadius: "50%",
            backgroundColor: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "16px",
            fontWeight: "bold",
            color: "#000",
            border: "1px solid #ccc",
            textAlign: "center",
            marginLeft: "10px",
          }}
        >
          <img
            src={
              userInfo?.ProfileImage ||
              "https://arc.accesshealthcare.co/IISFS/arc_rec/images/userimg.jpg"
            }
            alt="User Profile"
            style={{ borderRadius: "50%", width: "40px", height: "40px" }}
          />
        </div>
        {projectName !== "claimpathway" && (
        <Button icon="bell" stylingMode="text" style={{ marginLeft: "10px" }} />)}
      </div>
    </div>
  );
};

export default Header;