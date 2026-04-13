import React, { useState } from "react";
import { Link } from "react-router-dom";
import SearchBar from "./SearchBar";
import "../assets/css/category-navigation.css";
import { allTools } from "../data/allTools";

const CategoryNavigation = () => {
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const categories = [
    {
      id: 1,
      title: "Math Calculators",
      description: "Basic and advanced mathematical calculations",
      icon: "fas fa-calculator",
      color: "#1a1a1a",
      link: "/math",
    },
    {
      id: 2,
      title: "Finance Calculators",
      description: "Financial planning and investment tools",
      icon: "fas fa-dollar-sign",
      color: "#1a1a1a",
      link: "/finance",
    },
    {
      id: 3,
      title: "Science Calculators",
      description: "Scientific and engineering calculations",
      icon: "fas fa-atom",
      color: "#1a1a1a",
      link: "/science",
    },
    {
      id: 4,
      title: "Health Calculators",
      description: "Health and fitness calculations",
      icon: "fas fa-heartbeat",
      color: "#1a1a1a",
      link: "/health",
    },
    {
      id: 5,
      title: "Utility Tools",
      description: "Conversion and utility tools",
      icon: "fas fa-tools",
      color: "#1a1a1a",
      link: "/utility-tools",
    },
    {
      id: 6,
      title: "Knowledge Calculators",
      description: "Educational and knowledge-based tools",
      icon: "fas fa-brain",
      color: "#1a1a1a",
      link: "/knowledge",
    },
  ];

  const filterTabs = [
    {
      id: "all",
      title: "All Tools",
      icon: "fas fa-th-large",
      color: "#1a1a1a",
    },
    { id: "math", title: "Math", icon: "fas fa-calculator", color: "#1a1a1a" },
    {
      id: "finance",
      title: "Finance",
      icon: "fas fa-dollar-sign",
      color: "#1a1a1a",
    },
    { id: "science", title: "Science", icon: "fas fa-atom", color: "#1a1a1a" },
    {
      id: "health",
      title: "Health",
      icon: "fas fa-heartbeat",
      color: "#1a1a1a",
    },
    { id: "utility", title: "Utility", icon: "fas fa-tools", color: "#1a1a1a" },
    { id: "pdf", title: "PDF", icon: "fas fa-file-pdf", color: "#1a1a1a" },
    {
      id: "knowledge",
      title: "Knowledge",
      icon: "fas fa-brain",
      color: "#1a1a1a",
    },
  ];

  const handleFilterClick = (filterId) => {
    setActiveFilter(filterId);
    setSearchQuery(""); // Clear search when switching tabs
  };

  const handleSearchChange = (query) => {
    setSearchQuery(query);
    if (query) {
      setActiveFilter("all"); // Reset to all when searching
    }
  };

  // Filter tools based on search query or active filter
  const filteredTools = searchQuery
    ? allTools.filter(
      (tool) =>
        tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.category.toLowerCase().includes(searchQuery.toLowerCase())
    )
    : activeFilter === "all"
      ? allTools
      : allTools.filter((tool) => tool.category.toLowerCase() === activeFilter);

  const getCategoryColor = (category) => {
    const categoryMap = {
      Math: "#3b82f6",
      Finance: "#10b981",
      Science: "#f59e0b",
      Health: "#ec4899",
      Utility: "#8b5cf6",
      PDF: "#ef4444",
      Knowledge: "#f59e0b",
    };
    return categoryMap[category] || "#64748b";
  };

  const getToolColor = (index) => {
    const colors = [
      "#8b5cf6",
      "#3b82f6",
      "#10b981",
      "#f59e0b",
      "#ec4899",
      "#ef4444",
      "#06b6d4",
      "#84cc16",
    ];
    return colors[index % colors.length];
  };

  return (
    <section className="category-navigation">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">Explore Categories</h2>
          <p className="section-description">
            Choose from our comprehensive collection of calculators and tools
          </p>
        </div>

        <div className="categories-grid">
          {categories.map((category) => (
            <Link
              key={category.id}
              to={category.link}
              className="category-card"
              style={{ "--category-color": category.color }}
            >
              <div
                className="category-icon"
                style={{
                  backgroundColor: `${category.color}15`,
                  border: `1px solid ${category.color}30`,
                }}
              >
                <i
                  className={category.icon}
                  style={{ color: category.color }}
                ></i>
              </div>
              <div className="category-content">
                <h3 className="category-title">{category.title}</h3>
                <p className="category-description">{category.description}</p>
              </div>
              <div className="category-arrow">
                <i className="fas fa-arrow-right"></i>
              </div>
            </Link>
          ))}
        </div>

        {/* Search Bar */}
        <SearchBar
          allTools={allTools}
          onSearchChange={handleSearchChange}
          searchQuery={searchQuery}
          isSearching={!!searchQuery}
        />

        {/* Filter Tabs Section - Hidden when searching */}
        {!searchQuery && (
          <div className="filter-section">
            <div className="filter-tabs">
              {filterTabs.map((tab) => (
                <button
                  key={tab.id}
                  className={`filter-tab ${activeFilter === tab.id ? "active" : ""
                    }`}
                  onClick={() => handleFilterClick(tab.id)}
                  style={{ "--tab-color": tab.color }}
                >
                  <div
                    className="filter-tab-icon"
                    style={{
                      backgroundColor:
                        activeFilter === tab.id ? tab.color : `${tab.color}15`,
                      border: `1px solid ${activeFilter === tab.id ? tab.color : `${tab.color}30`
                        }`,
                    }}
                  >
                    <i
                      className={tab.icon}
                      style={{
                        color: activeFilter === tab.id ? "white" : tab.color,
                      }}
                    ></i>
                  </div>
                  <span className="filter-tab-title">{tab.title}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Tools Grid Section */}
        <div className="tools-section">
          <div className="tools-header">
            <h3 className="tools-title">
              {searchQuery
                ? `Search Results for "${searchQuery}"`
                : activeFilter === "all"
                  ? "All Tools"
                  : `${activeFilter.charAt(0).toUpperCase() + activeFilter.slice(1)
                  } Tools`}
            </h3>
            <p className="tools-count">
              {filteredTools.length}{" "}
              {filteredTools.length === 1 ? "tool" : "tools"} available
            </p>
          </div>

          <div className="tools-grid">
            {filteredTools.map((tool, index) => (
              <Link
                key={index}
                to={tool.url}
                className="tool-card"
                style={{ "--tool-color": getToolColor(index) }}
              >
                <div className="tool-icon">
                  <i className={tool.icon}></i>
                </div>
                <div className="tool-content">
                  <h4 className="tool-title">{tool.name}</h4>
                  <p className="tool-description">{tool.desc}</p>
                  <div className="tool-category">
                    <span className="tool-category-badge">{tool.category}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CategoryNavigation;
