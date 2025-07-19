import React, { useEffect, useRef } from "react";
import { Box } from "@mui/material";
import triggeredAlertsa from "../../assets/images/kpi2.svg";
import triggeredAlertsb from "../../assets/images/kpi3.svg";
import triggeredAlertsc from "../../assets/images/kpi4.svg";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store/store";
import { fetchKPILog } from "../../store/slice/homePageLogs";

interface AnalyticsProps {
  isPlaying: boolean;
}

const Analytics: React.FC<AnalyticsProps> = ({ isPlaying }) => {
  const dispatch = useDispatch<AppDispatch>();
  const intervalRefs = useRef<NodeJS.Timeout | null>(null);
  const { kpiLog } = useSelector((state: RootState) => state.logs);

  useEffect(() => {
    // Clear any existing interval
    if (intervalRefs.current) {
      clearInterval(intervalRefs.current);
      intervalRefs.current = null;
    }

    // Only start a new interval if `isPlaying` is false
    if (!isPlaying) {
      intervalRefs.current = setInterval(() => {
        dispatch(fetchKPILog());
      }, 5000);
    }

    // Cleanup on unmount
    return () => {
      if (intervalRefs.current) {
        clearInterval(intervalRefs.current);
      }
    };
  }, [isPlaying]);

  return (
    <Box>
      <Box
        sx={{ background: " #222D3A", borderRadius: "4px", padding: "10px" }}
      >
        <Box sx={{ display: "flex", gap: "20px", padding: "10px" }}>
          <Box sx={{ display: "flex", gap: "10px", marginRight: 3 }}>
            <span>
              <img
                src={triggeredAlertsa}
                alt="triggeredAlerts"
                style={{
                  background: "#EDEEFC",
                  padding: "3px",
                  borderRadius: "4px",
                }}
              ></img>
            </span>
            <Box>
              <p style={{ margin: "0", fontSize: "14px", color: "#ffffff" }}>
                {kpiLog?.total}
              </p>
              <p style={{ margin: "0", fontSize: "16px", color: "#ffffff" }}>
                Total Triggered Alerts
              </p>
            </Box>
          </Box>
          <Box sx={{ display: "flex", gap: "10px", marginRight: 3 }}>
            <span>
              <img
                src={triggeredAlertsb}
                alt="personOnDuty"
                style={{
                  background: "#EDEEFC",
                  padding: "3px",
                  borderRadius: "4px",
                }}
              ></img>
            </span>
            <Box>
              <p style={{ margin: "0", fontSize: "14px", color: "#ffffff" }}>
                {kpiLog?.detection}
              </p>
              <p style={{ margin: "0", fontSize: "16px", color: "#ffffff" }}>
                Elephant Detections
              </p>
            </Box>
          </Box>
          <Box sx={{ display: "flex", gap: "10px", marginRight: 3 }}>
            <span>
              <img
                src={triggeredAlertsc}
                alt="specied-detected"
                style={{
                  background: "#EDEEFC",
                  padding: "3px",
                  borderRadius: "4px",
                }}
              ></img>
            </span>
            <Box>
              <p style={{ margin: "0", fontSize: "14px", color: "#ffffff" }}>
                {kpiLog?.crossing}
              </p>
              <p style={{ margin: "0", fontSize: "16px", color: "#ffffff" }}>
                Village Spoting
              </p>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Analytics;
