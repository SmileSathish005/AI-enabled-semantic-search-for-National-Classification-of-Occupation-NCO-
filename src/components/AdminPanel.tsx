import React, { useState, useEffect } from 'react';
import { 
  Users, 
  FileText, 
  Database, 
  Settings, 
  Download, 
  Upload,
  Edit3,
  Trash2,
  Plus,
  Search,
  Filter,
  Calendar,
  Activity
} from 'lucide-react';
import { SearchAuditLog, NCOOccupation, AdminUser, OccupationUpdate } from '../types/nco';
import { searchEngine } from '../utils/searchEngine';
import { ncoOccupations } from '../data/ncoData';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'audit' | 'occupations' | 'settings'>('dashboard');
  const [auditLogs, setAuditLogs] = useState<SearchAuditLog[]>([]);
  const [occupations, setOccupations] = useState<NCOOccupation[]>(ncoOccupations);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOccupation, setSelectedOccupation] = useState<NCOOccupation | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setAuditLogs(searchEngine.getAuditLogs());
    }
  }, [isOpen]);

  const exportAuditLogs = () => {
    const dataStr = searchEngine.exportAuditLogs();
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `nco_audit_logs_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportOccupations = () => {
    const dataStr = JSON.stringify(occupations, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `nco_occupations_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const filteredOccupations = occupations.filter(occ =>
    occ.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    occ.code.includes(searchQuery) ||
    occ.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Settings className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Admin Panel</h2>
              <p className="text-sm text-gray-600">NCO Database Management</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="w-64 bg-gray-50 border-r border-gray-200 p-4">
            <nav className="space-y-2">
              {[
                { id: 'dashboard', label: 'Dashboard', icon: Activity },
                { id: 'users', label: 'Users', icon: Users },
                { id: 'audit', label: 'Audit Logs', icon: FileText },
                { id: 'occupations', label: 'Occupations', icon: Database },
                { id: 'settings', label: 'Settings', icon: Settings }
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id as any)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    activeTab === id
                      ? 'bg-blue-100 text-blue-700 font-medium'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              ))}
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-auto">
            {activeTab === 'dashboard' && (
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Dashboard Overview</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <Database className="h-8 w-8 text-blue-600" />
                      <div>
                        <div className="text-2xl font-bold text-blue-900">{occupations.length}</div>
                        <div className="text-sm text-blue-700">Total Occupations</div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <FileText className="h-8 w-8 text-green-600" />
                      <div>
                        <div className="text-2xl font-bold text-green-900">{auditLogs.length}</div>
                        <div className="text-sm text-green-700">Search Queries</div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <Users className="h-8 w-8 text-purple-600" />
                      <div>
                        <div className="text-2xl font-bold text-purple-900">1</div>
                        <div className="text-sm text-purple-700">Active Users</div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <Activity className="h-8 w-8 text-orange-600" />
                      <div>
                        <div className="text-2xl font-bold text-orange-900">
                          {auditLogs.filter(log => 
                            new Date(log.timestamp).toDateString() === new Date().toDateString()
                          ).length}
                        </div>
                        <div className="text-sm text-orange-700">Today's Searches</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8">
                  <h4 className="text-md font-medium text-gray-900 mb-4">Recent Activity</h4>
                  <div className="bg-white border border-gray-200 rounded-lg">
                    {auditLogs.slice(-5).reverse().map((log, index) => (
                      <div key={log.id} className={`p-4 ${index !== 4 ? 'border-b border-gray-100' : ''}`}>
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-gray-900">Search: "{log.query}"</div>
                            <div className="text-sm text-gray-600">
                              {log.resultsCount} results • {log.searchTime.toFixed(0)}ms • {log.language}
                            </div>
                          </div>
                          <div className="text-sm text-gray-500">
                            {new Date(log.timestamp).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'audit' && (
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Audit Logs</h3>
                  <button
                    onClick={exportAuditLogs}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    <Download className="h-4 w-4" />
                    Export Logs
                  </button>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Timestamp
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Query
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Results
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Time (ms)
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Language
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Input Method
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {auditLogs.slice().reverse().map((log) => (
                          <tr key={log.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {new Date(log.timestamp).toLocaleString()}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900 max-w-xs truncate">
                              {log.query}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {log.resultsCount}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {log.searchTime.toFixed(0)}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {log.language}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                log.inputMethod === 'voice' 
                                  ? 'bg-purple-100 text-purple-800' 
                                  : 'bg-blue-100 text-blue-800'
                              }`}>
                                {log.inputMethod}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'occupations' && (
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Occupation Management</h3>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={exportOccupations}
                      className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      <Download className="h-4 w-4" />
                      Export
                    </button>
                    <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
                      <Plus className="h-4 w-4" />
                      Add New
                    </button>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search occupations..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Code
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Title
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Division
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Skill Level
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Sector
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredOccupations.slice(0, 50).map((occupation) => (
                          <tr key={occupation.code} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm font-mono text-gray-900">
                              {occupation.code}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900 max-w-xs truncate">
                              {occupation.title}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {occupation.division}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {occupation.skillLevel}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {occupation.sector}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => setSelectedOccupation(occupation)}
                                  className="text-blue-600 hover:text-blue-700 transition-colors"
                                >
                                  <Edit3 className="h-4 w-4" />
                                </button>
                                <button className="text-red-600 hover:text-red-700 transition-colors">
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'users' && (
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">User Management</h3>
                  <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
                    <Plus className="h-4 w-4" />
                    Add User
                  </button>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">User Management</h4>
                  <p className="text-gray-600">
                    User management functionality would be implemented here with proper authentication and authorization.
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">System Settings</h3>
                
                <div className="space-y-6">
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h4 className="text-md font-medium text-gray-900 mb-4">Search Configuration</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Default Results Limit
                        </label>
                        <input
                          type="number"
                          defaultValue={10}
                          className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Minimum Confidence Threshold
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="1"
                          defaultValue={0.1}
                          className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h4 className="text-md font-medium text-gray-900 mb-4">Data Management</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Import NCO Data
                        </label>
                        <div className="flex items-center gap-3">
                          <input
                            type="file"
                            accept=".json,.csv,.xlsx"
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                          />
                          <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
                            <Upload className="h-4 w-4" />
                            Import
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};