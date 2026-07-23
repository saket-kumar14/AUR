"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  LayoutDashboard, BookOpen, Building2, Settings, LogOut,
  Users, GraduationCap, FileCheck, ShieldCheck, CheckCircle2,
  Image as ImageIcon, Search
} from "lucide-react";

// --- MOCK DATA ---
const mockData = {
  universityName: "Stanford University",
  registrationNumber: "REG-2023-XYZ",
  status: "Profile Live", // 'Profile Live' | 'Pending Verification'
  description: "Stanford University is a private research university in Stanford, California. The campus occupies 8,180 acres, among the largest in the United States, and enrolls over 17,000 students. It is considered one of the most prestigious universities in the world.",
  rankingScore: 98.5,
  stats: {
    totalStudents: 17326,
    totalStaff: 2288,
    totalCourses: 145,
    totalColleges: 7
  },
  courses: [
    { id: 1, name: "B.Tech Computer Science", college: "School of Engineering", fee: "$65,000/yr" },
    { id: 2, name: "MBA Finance", college: "Graduate School of Business", fee: "$75,000/yr" },
    { id: 3, name: "B.Sc Physics", college: "School of Humanities & Sciences", fee: "$60,000/yr" },
    { id: 4, name: "MD Medicine", college: "School of Medicine", fee: "$85,000/yr" },
  ],
  colleges: [
    "School of Engineering",
    "Graduate School of Business",
    "School of Medicine",
    "School of Law",
    "School of Humanities & Sciences"
  ],
  gallery: [
    "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80&w=400",
    "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&q=80&w=400",
    "https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?auto=format&fit=crop&q=80&w=400",
    "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80&w=400"
  ]
};

// --- COMPONENTS ---

const Sidebar = ({ activeTab, setActiveTab, onLogout }: any) => {
  const tabs = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "courses", label: "Manage Courses", icon: BookOpen },
    { id: "colleges", label: "Affiliated Colleges", icon: Building2 },
    { id: "settings", label: "Edit Profile", icon: Settings },
  ];

  return (
    <div className="w-64 bg-[#1A365D] min-h-screen text-white flex flex-col fixed left-0 top-0 bottom-0 shadow-2xl z-20">
      <div className="p-6 border-b border-white/10 flex items-center space-x-3 bg-white/5 backdrop-blur-sm">
        <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center border border-white/20 shadow-inner">
          <ShieldCheck className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-bold leading-tight tracking-wide">Admin Portal</h2>
          <p className="text-blue-200 text-xs font-medium">University Manager</p>
        </div>
      </div>

      <nav className="flex-1 py-8 px-4 space-y-2 overflow-y-auto">
        <div className="text-xs font-bold text-blue-300/70 uppercase tracking-wider mb-4 ml-2">Menu</div>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${
              activeTab === tab.id 
                ? "bg-white text-[#1A365D] shadow-lg font-bold translate-x-1" 
                : "text-blue-100/70 hover:bg-white/10 hover:text-white"
            }`}
          >
            <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? "text-[#1A365D]" : ""}`} />
            <span>{tab.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-6 border-t border-white/10 bg-black/10">
        <button 
          onClick={onLogout}
          className="w-full flex items-center justify-center space-x-2 px-4 py-3 text-red-300 hover:bg-red-500/20 hover:text-red-100 rounded-xl transition-all font-bold border border-transparent hover:border-red-500/30"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout Session</span>
        </button>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon: Icon, color }: any) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm hover:shadow-md flex items-center justify-between group transition-all duration-300"
  >
    <div>
      <p className="text-sm font-bold text-slate-500 mb-1">{title}</p>
      <h3 className="text-3xl font-black text-[#1A365D] tracking-tight">{value}</h3>
    </div>
    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${color} transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 shadow-inner`}>
      <Icon className="w-7 h-7" />
    </div>
  </motion.div>
);

const MainContent = ({ data }: { data: typeof mockData }) => {
  return (
    <div className="space-y-8 pb-10">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Students" value={data.stats.totalStudents.toLocaleString()} icon={Users} color="bg-blue-50 text-blue-600 border border-blue-100" />
        <StatCard title="Total Staff" value={data.stats.totalStaff.toLocaleString()} icon={GraduationCap} color="bg-emerald-50 text-emerald-600 border border-emerald-100" />
        <StatCard title="Courses Offered" value={data.stats.totalCourses.toString()} icon={BookOpen} color="bg-amber-50 text-amber-600 border border-amber-100" />
        <StatCard title="Affiliated Colleges" value={data.stats.totalColleges.toString()} icon={Building2} color="bg-purple-50 text-purple-600 border border-purple-100" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          
          {/* About Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="bg-[#1A365D] p-4 flex items-center space-x-3">
              <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                <FileCheck className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-lg font-bold text-white">About University</h3>
            </div>
            <div className="p-6 space-y-5">
              <div className="inline-block">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Registration Code</p>
                <p className="text-[#1A365D] font-bold bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">{data.registrationNumber}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Description</p>
                <p className="text-slate-600 leading-relaxed text-sm font-medium">{data.description}</p>
              </div>
            </div>
          </motion.div>

          {/* Courses & Fees Table */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="bg-[#1A365D] p-4 flex items-center space-x-3">
              <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-lg font-bold text-white">Courses & Fees</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs">Course Name</th>
                    <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs">College</th>
                    <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs text-right">Fee</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.courses.map((course) => (
                    <tr key={course.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-6 py-4 font-bold text-[#1A365D]">{course.name}</td>
                      <td className="px-6 py-4 text-slate-600 font-medium">{course.college}</td>
                      <td className="px-6 py-4 text-slate-900 font-black text-right bg-slate-50/50 group-hover:bg-slate-100/50">{course.fee}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>

        <div className="space-y-8">
          {/* Colleges List */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="bg-[#1A365D] p-4 flex items-center space-x-3">
              <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                <Building2 className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-lg font-bold text-white">Affiliated Colleges</h3>
            </div>
            <ul className="divide-y divide-slate-100 max-h-[350px] overflow-y-auto p-2">
              {data.colleges.map((college, idx) => (
                <li key={idx} className="px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 rounded-lg flex items-center transition-colors cursor-default">
                  <div className="w-2.5 h-2.5 bg-[#1A365D]/20 rounded-full mr-3 border border-[#1A365D]/40" />
                  {college}
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Media Gallery */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="bg-[#1A365D] p-4 flex items-center space-x-3">
              <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                <ImageIcon className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-lg font-bold text-white">Media Gallery</h3>
            </div>
            <div className="p-4 grid grid-cols-2 gap-3 bg-slate-50">
              {data.gallery.map((img, idx) => (
                <div key={idx} className="aspect-square rounded-xl overflow-hidden border-2 border-white shadow-sm relative group cursor-pointer">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img} alt={`Gallery ${idx}`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 group-hover:rotate-1" />
                  <div className="absolute inset-0 bg-[#1A365D]/0 group-hover:bg-[#1A365D]/10 transition-colors duration-300" />
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default function Dashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    router.push("/admin/login");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={handleLogout} />
      
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 h-20 px-8 flex items-center justify-between sticky top-0 z-10 shadow-sm">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-[#1A365D] rounded-xl flex items-center justify-center shadow-inner text-white font-black text-xl tracking-tighter">
              SU
            </div>
            <div>
              <h1 className="text-xl font-black text-[#1A365D] tracking-tight">{mockData.universityName}</h1>
              <div className="flex items-center mt-1">
                {mockData.status === "Profile Live" ? (
                  <span className="flex items-center text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-200 uppercase tracking-wider">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    {mockData.status}
                  </span>
                ) : (
                  <span className="flex items-center text-[11px] font-bold text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-200 uppercase tracking-wider">
                    {mockData.status}
                  </span>
                )}
                <span className="mx-2 text-slate-300">•</span>
                <span className="flex items-center text-[11px] font-bold text-[#1A365D] bg-[#1A365D]/10 px-2.5 py-0.5 rounded-full border border-[#1A365D]/20 uppercase tracking-wider">
                  AUR Score: {mockData.rankingScore}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-6">
            <div className="relative group">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-[#1A365D] transition-colors" />
              <input 
                type="text" 
                placeholder="Search dashboard..." 
                className="bg-slate-100 border border-transparent text-sm font-medium rounded-full pl-9 pr-4 py-2 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1A365D]/30 focus:border-[#1A365D]/50 w-64 transition-all placeholder:text-slate-400" 
              />
            </div>
            
            <div className="w-px h-8 bg-slate-200" />
            
            <div className="flex items-center space-x-3 cursor-pointer group">
              <div className="text-right hidden md:block">
                <p className="text-sm font-bold text-slate-900 leading-tight group-hover:text-[#1A365D] transition-colors">Admin User</p>
                <p className="text-xs text-slate-500 font-medium">admin@stanford.edu</p>
              </div>
              <div className="w-10 h-10 bg-slate-200 rounded-full border-2 border-white shadow-sm overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="Admin" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 p-8">
          {activeTab === "overview" && <MainContent data={mockData} />}
          {activeTab !== "overview" && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="h-[60vh] flex items-center justify-center"
            >
              <div className="text-center bg-white p-12 rounded-3xl border border-slate-200 shadow-sm max-w-md w-full">
                <div className="w-20 h-20 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-slate-100">
                  <Settings className="w-10 h-10 text-slate-300 animate-spin" />
                </div>
                <h2 className="text-2xl font-black text-[#1A365D] mb-2 capitalize">{activeTab} Module</h2>
                <p className="text-slate-500 font-medium leading-relaxed">This section of the dashboard is currently under construction and will be available soon.</p>
              </div>
            </motion.div>
          )}
        </main>
      </div>
    </div>
  );
}
