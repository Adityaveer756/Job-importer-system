"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { format } from "date-fns";
import "./styles.css";

interface ImportLog {
  _id: string;
  feedUrl: string;
  timestamp: string;
  totalFetched: number;
  newJobs: number;
  updatedJobs: number;
  failedJobs: { reason: string }[];
}

interface ImportLogResponse {
  success: boolean;
  data?: ImportLog[];
  message?: string;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  timestamp: string;
}

export default function ImportHistoryPage() {
  const [logs, setLogs] = useState<ImportLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<ImportLogResponse['pagination'] | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchLogs = async (page: number = 1) => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', '5');

      const response = await axios.get<ImportLogResponse>(
        `${process.env.NEXT_PUBLIC_API_URL}/import-logs/getImportLogsData?${params.toString()}`
      );
      if (response.data.success) {
        setLogs(response.data.data || []);
        setPagination(response.data.pagination);
      } else {
        setError(response.data.error ?? 'Failed to fetch logs');
      }
    } catch (err) {
      console.error("Failed to fetch logs:", err);
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 400) {
          setError('Invalid request parameters. Please check your search criteria.');
        } else if (err.response?.status === 503) {
          setError('Service temporarily unavailable. Please try again later.');
        } else if (err.response?.status === 500) {
          setError('Server error occurred. Please try again later.');
        } else {
          setError(`Failed to fetch logs: ${err.response?.data?.message || err.message}`);
        }
      } else {
        setError('An unexpected error occurred while fetching logs.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(currentPage);
  }, [currentPage]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  let content;

  if (loading) {
    content = (
      <div className="loading-container">
        <p className="info-text">Loading import logs...</p>
      </div>
    );
  } else if (error) {
    content = (
      <div className="error-container">
        <p className="error-text">{error}</p>
        <button 
          onClick={() => fetchLogs(currentPage)}
          className="retry-button"
        >
          Retry
        </button>
      </div>
    );
  } else if (logs.length === 0) {
    content = (
      <div className="empty-container">
        <p className="info-text">No logs available.</p>
      </div>
    );
  } else {
    content = (
      <>
        <div className="table-container">
          <table className="log-table">
            <thead>
              <tr>
                <th>Feed URL</th>
                <th>Timestamp</th>
                <th>Total Fetched</th>
                <th>New Jobs</th>
                <th>Updated Jobs</th>
                <th>Failed Jobs</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log._id}>
                  <td className="feed-url-cell">{log.feedUrl}</td>
                  <td>{format(new Date(log.timestamp), "PPpp")}</td>
                  <td className="text-center">{log.totalFetched}</td>
                  <td className="text-center text-green">{log.newJobs}</td>
                  <td className="text-center text-yellow">{log.updatedJobs}</td>
                  <td className="text-center text-red">{log.failedJobs.length}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {pagination && pagination.totalPages > 1 && (
          <div className="pagination">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="pagination-button"
            >
              Previous
            </button>
            <span className="pagination-info">
              Page {currentPage} of {pagination.totalPages} 
              ({pagination.total} total logs)
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === pagination.totalPages}
              className="pagination-button"
            >
              Next
            </button>
          </div>
        )}
      </>
    );
  }

  return (
    <main className="main">
      <h1 className="title">Import History</h1>
      {content}
    </main>
  );
}
