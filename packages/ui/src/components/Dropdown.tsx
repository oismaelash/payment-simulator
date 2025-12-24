"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";

export interface DropdownOption {
  value: string;
  label?: string;
  meta?: string;
}

interface DropdownProps {
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  searchable?: boolean;
  searchPlaceholder?: string;
  emptyText?: string;
  className?: string;
  style?: React.CSSProperties;
}

export default function Dropdown({
  options,
  value,
  onChange,
  placeholder = "-- Select --",
  disabled = false,
  searchable = true,
  searchPlaceholder = "Search...",
  emptyText = "No options found",
  className = "",
  style,
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [menuPosition, setMenuPosition] = useState<{ top: number; left: number; width: number } | null>(null);
  
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Filter options based on search query
  const filteredOptions = searchable && searchQuery.trim()
    ? options.filter((opt) => {
        const label = opt.label || opt.value;
        return label.toLowerCase().includes(searchQuery.toLowerCase()) ||
               opt.value.toLowerCase().includes(searchQuery.toLowerCase());
      })
    : options;

  // Find selected option
  const selectedOption = options.find((opt) => opt.value === value);
  const displayValue = selectedOption ? (selectedOption.label || selectedOption.value) : "";

  // Calculate menu position
  const updateMenuPosition = useCallback(() => {
    if (!triggerRef.current) return;

    const rect = triggerRef.current.getBoundingClientRect();
    const scrollY = window.scrollY || window.pageYOffset;
    const scrollX = window.scrollX || window.pageXOffset;

    setMenuPosition({
      top: rect.bottom + scrollY + 4,
      left: rect.left + scrollX,
      width: rect.width,
    });
  }, []);

  // Toggle dropdown (open/close)
  const handleToggle = () => {
    if (disabled) return;
    if (isOpen) {
      handleClose();
    } else {
      handleOpen();
    }
  };

  // Open dropdown
  const handleOpen = () => {
    if (disabled) return;
    setIsOpen(true);
    updateMenuPosition();
  };

  // Close dropdown
  const handleClose = () => {
    setIsOpen(false);
    setSearchQuery("");
    setHighlightedIndex(-1);
  };

  // Handle option selection
  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    handleClose();
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    if (!isOpen) {
      if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
        e.preventDefault();
        handleOpen();
      }
      return;
    }

    switch (e.key) {
      case "Escape":
        e.preventDefault();
        handleClose();
        triggerRef.current?.focus();
        break;
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) => {
          const next = prev < filteredOptions.length - 1 ? prev + 1 : 0;
          return next;
        });
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) => {
          const next = prev > 0 ? prev - 1 : filteredOptions.length - 1;
          return next;
        });
        break;
      case "Enter":
        e.preventDefault();
        if (highlightedIndex >= 0 && filteredOptions[highlightedIndex]) {
          handleSelect(filteredOptions[highlightedIndex].value);
        }
        break;
      case "Home":
        e.preventDefault();
        setHighlightedIndex(0);
        break;
      case "End":
        e.preventDefault();
        setHighlightedIndex(filteredOptions.length - 1);
        break;
    }
  };

  // Click outside handler
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node) &&
        menuRef.current &&
        !menuRef.current.contains(e.target as Node)
      ) {
        handleClose();
      }
    };

    const handleScroll = () => {
      updateMenuPosition();
    };

    const handleResize = () => {
      updateMenuPosition();
    };

    document.addEventListener("mousedown", handleClickOutside, true);
    window.addEventListener("scroll", handleScroll, true);
    window.addEventListener("resize", handleResize);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside, true);
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", handleResize);
    };
  }, [isOpen, updateMenuPosition]);

  // Focus search input when menu opens
  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 0);
    }
  }, [isOpen, searchable]);

  // Scroll highlighted item into view
  useEffect(() => {
    if (highlightedIndex >= 0 && menuRef.current) {
      const item = menuRef.current.querySelector(`[data-index="${highlightedIndex}"]`);
      if (item) {
        item.scrollIntoView({ block: "nearest", behavior: "smooth" });
      }
    }
  }, [highlightedIndex]);

  // Reset highlighted index when search changes
  useEffect(() => {
    setHighlightedIndex(-1);
  }, [searchQuery]);

  const menuContent = (
    <div
      ref={menuRef}
      className="dropdown-menu"
      style={{
        position: "fixed",
        top: menuPosition?.top,
        left: menuPosition?.left,
        width: menuPosition?.width,
        display: isOpen ? "flex" : "none",
        flexDirection: "column",
        zIndex: 1000,
      }}
      role="listbox"
      aria-label="Options"
    >
      {searchable && (
        <div className="dropdown-search-wrapper">
          <span className="material-symbols-outlined dropdown-search-icon">search</span>
          <input
            ref={searchInputRef}
            type="text"
            className="dropdown-search"
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                e.preventDefault();
                handleClose();
                triggerRef.current?.focus();
              } else if (e.key === "ArrowDown") {
                e.preventDefault();
                setHighlightedIndex(0);
              }
            }}
          />
        </div>
      )}
      <div className="dropdown-list custom-scrollbar">
        {filteredOptions.length === 0 ? (
          <div className="dropdown-empty">{emptyText}</div>
        ) : (
          filteredOptions.map((option, index) => {
            const isSelected = option.value === value;
            const isHighlighted = index === highlightedIndex;
            const label = option.label || option.value;

            return (
              <div
                key={option.value}
                data-index={index}
                className={`dropdown-item ${isSelected ? "dropdown-item-selected" : ""} ${isHighlighted ? "dropdown-item-active" : ""}`}
                role="option"
                aria-selected={isSelected}
                onClick={() => handleSelect(option.value)}
                onMouseEnter={() => setHighlightedIndex(index)}
              >
                <span className="dropdown-item-label">{label}</span>
                {option.meta && (
                  <span className="dropdown-item-meta">{option.meta}</span>
                )}
                {isSelected && (
                  <span className="material-symbols-outlined dropdown-item-check">check</span>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );

  return (
    <div className={`dropdown-wrapper ${className}`} style={style}>
      <button
        ref={triggerRef}
        type="button"
        className="dropdown-trigger"
        disabled={disabled}
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-controls="dropdown-menu"
      >
        <span className="dropdown-trigger-text">
          {displayValue || <span className="dropdown-placeholder">{placeholder}</span>}
        </span>
        <span
          className={`material-symbols-outlined dropdown-trigger-icon ${isOpen ? "dropdown-trigger-icon-open" : ""}`}
        >
          unfold_more
        </span>
      </button>
      {isOpen && menuPosition && typeof window !== "undefined" && createPortal(menuContent, document.body)}
    </div>
  );
}

