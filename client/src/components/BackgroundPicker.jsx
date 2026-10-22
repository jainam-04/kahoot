import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Image, Upload, Settings, Search, Heart, ZoomIn, ZoomOut, Download, Check, ExternalLink, X, ChevronLeft, ChevronRight, Sparkles, Monitor, Smartphone } from 'lucide-react';
import toast from 'react-hot-toast';
import { useTheme } from '../context/ThemeContext';

const BG_PRESETS = {
  Education: [
    { id: 'edu1', url: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=800&auto=format&fit=crop&q=60', label: 'Blackboard' },
    { id: 'edu2', url: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=800&auto=format&fit=crop&q=60', label: 'Library Books' },
    { id: 'edu3', url: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&auto=format&fit=crop&q=60', label: 'Stack of Books' },
    { id: 'edu4', url: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&auto=format&fit=crop&q=60', label: 'Class Study' },
    { id: 'edu5', url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=60', label: 'Digital Learning' },
    { id: 'edu6', url: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&auto=format&fit=crop&q=60', label: 'Study Desk' }
  ],
  Space: [
    { id: 'sp1', url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=60', label: 'Deep Cosmos' },
    { id: 'sp2', url: 'https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?w=800&auto=format&fit=crop&q=60', label: 'Starry Sky' },
    { id: 'sp3', url: 'https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3?w=800&auto=format&fit=crop&q=60', label: 'Nebula Space' },
    { id: 'sp4', url: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=800&auto=format&fit=crop&q=60', label: 'Orion Nebula' },
    { id: 'sp5', url: 'https://images.unsplash.com/photo-1538370965046-79c0d6907d47?w=800&auto=format&fit=crop&q=60', label: 'Galaxy Glow' },
    { id: 'sp6', url: 'https://images.unsplash.com/photo-1502134249126-9f3755a50d78?w=800&auto=format&fit=crop&q=60', label: 'Astronaut View' }
  ],
  Nature: [
    { id: 'nat1', url: 'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=800&auto=format&fit=crop&q=60', label: 'Forest Path' },
    { id: 'nat2', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=60', label: 'Tropical Beach' },
    { id: 'nat3', url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&auto=format&fit=crop&q=60', label: 'Misty Mountains' },
    { id: 'nat4', url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&auto=format&fit=crop&q=60', label: 'Green Meadows' },
    { id: 'nat5', url: 'https://images.unsplash.com/photo-1500485035595-cbe6f645feb1?w=800&auto=format&fit=crop&q=60', label: 'Misty Lake' },
    { id: 'nat6', url: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=800&auto=format&fit=crop&q=60', label: 'Sunset Desert' }
  ],
  Technology: [
    { id: 'tech1', url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=60', label: 'Microchip' },
    { id: 'tech2', url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=60', label: 'Matrix Code' },
    { id: 'tech3', url: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&auto=format&fit=crop&q=60', label: 'Cyber Security' },
    { id: 'tech4', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=60', label: 'Digital Grid' },
    { id: 'tech5', url: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=800&auto=format&fit=crop&q=60', label: 'Abstract Tech' },
    { id: 'tech6', url: 'https://images.unsplash.com/photo-1607799279861-4dd421887fb3?w=800&auto=format&fit=crop&q=60', label: 'Coding Screen' }
  ],
  Gaming: [
    { id: 'game1', url: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=800&auto=format&fit=crop&q=60', label: 'Neon Setup' },
    { id: 'game2', url: 'https://images.unsplash.com/photo-1612287230202-1bf1d85d1bdf?w=800&auto=format&fit=crop&q=60', label: 'Game Console' },
    { id: 'game3', url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&auto=format&fit=crop&q=60', label: 'Retro Toys' },
    { id: 'game4', url: 'https://images.unsplash.com/photo-1600861195091-690c92f1d2cc?w=800&auto=format&fit=crop&q=60', label: 'RGB Keyboard' },
    { id: 'game5', url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=60', label: 'Esports Arena' },
    { id: 'game6', url: 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=800&auto=format&fit=crop&q=60', label: 'Pixel Joystick' }
  ],
  Neon: [
    { id: 'neon1', url: 'https://images.unsplash.com/photo-1507608869274-d3177c8bb4c7?w=800&auto=format&fit=crop&q=60', label: 'Tokyo Night' },
    { id: 'neon2', url: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=800&auto=format&fit=crop&q=60', label: 'Cyber City' },
    { id: 'neon3', url: 'https://images.unsplash.com/photo-1543536448-d209d2d13a1c?w=800&auto=format&fit=crop&q=60', label: 'Neon Lines' },
    { id: 'neon4', url: 'https://images.unsplash.com/photo-1554050857-c84a8abdb5e2?w=800&auto=format&fit=crop&q=60', label: 'Fluorescent Tunnel' },
    { id: 'neon5', url: 'https://images.unsplash.com/photo-1569172122301-bc5008bc09c5?w=800&auto=format&fit=crop&q=60', label: 'Neon Abstract' },
    { id: 'neon6', url: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=800&auto=format&fit=crop&q=60', label: 'Pink Neon Tube' }
  ],
  Minimal: [
    { id: 'min1', url: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=800&auto=format&fit=crop&q=60', label: 'Soft Pastel' },
    { id: 'min2', url: 'https://images.unsplash.com/photo-1506220926022-cc5c12acdb35?w=800&auto=format&fit=crop&q=60', label: 'Grid Paper' },
    { id: 'min3', url: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=800&auto=format&fit=crop&q=60', label: 'Smooth Gradient' },
    { id: 'min4', url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop&q=60', label: 'Grey Concrete' },
    { id: 'min5', url: 'https://images.unsplash.com/photo-1518655061766-48f53a57b6f6?w=800&auto=format&fit=crop&q=60', label: 'Simple Lines' },
    { id: 'min6', url: 'https://images.unsplash.com/photo-1489875347897-49f64b51c1f8?w=800&auto=format&fit=crop&q=60', label: 'Subtle Shadow' }
  ],
  Abstract: [
    { id: 'abs1', url: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=800&auto=format&fit=crop&q=60', label: 'Fluid Ink' },
    { id: 'abs2', url: 'https://images.unsplash.com/photo-1549490349-8643362247b5?w=800&auto=format&fit=crop&q=60', label: 'Colorful Paint' },
    { id: 'abs3', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=60', label: '3D Waves' },
    { id: 'abs4', url: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800&auto=format&fit=crop&q=60', label: 'Creative Shapes' },
    { id: 'abs5', url: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=800&auto=format&fit=crop&q=60', label: 'Abstract Smoke' },
    { id: 'abs6', url: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=800&auto=format&fit=crop&q=60', label: 'Warm Swirls' }
  ],
  Gradient: [
    { id: 'grad1', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=60', label: 'Aurora Sky' },
    { id: 'grad2', url: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=800&auto=format&fit=crop&q=60', label: 'Deep Blue' },
    { id: 'grad3', url: 'https://images.unsplash.com/photo-1557683311-eac922347aa1?w=800&auto=format&fit=crop&q=60', label: 'Sunset Red' },
    { id: 'grad4', url: 'https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?w=800&auto=format&fit=crop&q=60', label: 'Dreamy Pastel' },
    { id: 'grad5', url: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&auto=format&fit=crop&q=60', label: 'Rainbow Mesh' },
    { id: 'grad6', url: 'https://images.unsplash.com/photo-1604871000636-074fa5117945?w=800&auto=format&fit=crop&q=60', label: 'Techno Neon' }
  ],
  Festival: [
    { id: 'fest1', url: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=800&auto=format&fit=crop&q=60', label: 'Fireworks' },
    { id: 'fest2', url: 'https://images.unsplash.com/photo-1507504038482-76210f6ecddb?w=800&auto=format&fit=crop&q=60', label: 'Party Confetti' },
    { id: 'fest3', url: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&auto=format&fit=crop&q=60', label: 'Balloons' },
    { id: 'fest4', url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=60', label: 'Concert Lights' },
    { id: 'fest5', url: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&auto=format&fit=crop&q=60', label: 'Dance Floor' },
    { id: 'fest6', url: 'https://images.unsplash.com/photo-1481162854517-d9e353af153d?w=800&auto=format&fit=crop&q=60', label: 'Carnival Fair' }
  ],
  Cartoon: [
    { id: 'cart1', url: 'https://images.unsplash.com/photo-1560942485-b2a11cc13456?w=800&auto=format&fit=crop&q=60', label: 'Kawaii Doodle' },
    { id: 'cart2', url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop&q=60', label: 'Fantasy Clouds' },
    { id: 'cart3', url: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800&auto=format&fit=crop&q=60', label: 'Anime Sunset' },
    { id: 'cart4', url: 'https://images.unsplash.com/photo-1518887570146-0612132dd618?w=800&auto=format&fit=crop&q=60', label: 'Cute Pattern' },
    { id: 'cart5', url: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800&auto=format&fit=crop&q=60', label: 'Fairytale House' },
    { id: 'cart6', url: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=800&auto=format&fit=crop&q=60', label: 'Forest Cartoon' }
  ],
  Science: [
    { id: 'sci1', url: 'https://images.unsplash.com/photo-1532187643603-ba119ca4109e?w=800&auto=format&fit=crop&q=60', label: 'Chemistry Lab' },
    { id: 'sci2', url: 'https://images.unsplash.com/photo-1617155093730-a8bf47be792d?w=800&auto=format&fit=crop&q=60', label: 'Molecular Bonds' },
    { id: 'sci3', url: 'https://images.unsplash.com/photo-1507668077129-56e32842fceb?w=800&auto=format&fit=crop&q=60', label: 'DNA Double Helix' },
    { id: 'sci4', url: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&auto=format&fit=crop&q=60', label: 'Physics Formulas' },
    { id: 'sci5', url: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&auto=format&fit=crop&q=60', label: 'Physics Study' },
    { id: 'sci6', url: 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?w=800&auto=format&fit=crop&q=60', label: 'Biotech Data' }
  ]
};

const PEXELS_API_KEY = import.meta.env.VITE_PEXELS_API_KEY || '563492ad6f91700001000001f357f8674d814c81b2385b46b280e6c5';

const LOCAL_PIXEL_LIBRARY = {
  nature: [
    {
      id: 'lnat1',
      photographer: 'Jay Mantri',
      photographer_url: 'https://unsplash.com/@jaymantri',
      url: 'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=1200&auto=format&fit=crop&q=80',
      src: {
        medium: 'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=600&auto=format&fit=crop&q=60',
        large2x: 'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=1200&auto=format&fit=crop&q=80',
        original: 'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d'
      },
      label: 'Forest Path Nature green wood',
      category: 'nature'
    },
    {
      id: 'lnat2',
      photographer: 'Sean Oulashin',
      photographer_url: 'https://unsplash.com/@seanoulashin',
      url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&auto=format&fit=crop&q=80',
      src: {
        medium: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=60',
        large2x: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&auto=format&fit=crop&q=80',
        original: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e'
      },
      label: 'Tropical Beach Nature ocean sunset sea',
      category: 'nature'
    },
    {
      id: 'lnat3',
      photographer: 'Kal Vis',
      photographer_url: 'https://unsplash.com/@kalvis',
      url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&auto=format&fit=crop&q=80',
      src: {
        medium: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&auto=format&fit=crop&q=60',
        large2x: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&auto=format&fit=crop&q=80',
        original: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b'
      },
      label: 'Misty Mountains Nature landscape sky peak',
      category: 'nature'
    },
    {
      id: 'lnat4',
      photographer: 'Bence Balla',
      photographer_url: 'https://unsplash.com/@benceballad',
      url: 'https://images.unsplash.com/photo-1500485035595-cbe6f645feb1?w=1200&auto=format&fit=crop&q=80',
      src: {
        medium: 'https://images.unsplash.com/photo-1500485035595-cbe6f645feb1?w=600&auto=format&fit=crop&q=60',
        large2x: 'https://images.unsplash.com/photo-1500485035595-cbe6f645feb1?w=1200&auto=format&fit=crop&q=80',
        original: 'https://images.unsplash.com/photo-1500485035595-cbe6f645feb1'
      },
      label: 'Misty Lake Nature silence water forest trees',
      category: 'nature'
    },
    {
      id: 'lnat5',
      photographer: 'John Fowler',
      photographer_url: 'https://unsplash.com/@jfowler',
      url: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=1200&auto=format&fit=crop&q=80',
      src: {
        medium: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=600&auto=format&fit=crop&q=60',
        large2x: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=1200&auto=format&fit=crop&q=80',
        original: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9'
      },
      label: 'Sunset Desert Nature sand dunes sun sky',
      category: 'nature'
    },
    {
      id: 'lnat6',
      photographer: 'Dave Hoefler',
      photographer_url: 'https://unsplash.com/@davehoefler',
      url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&auto=format&fit=crop&q=80',
      src: {
        medium: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&auto=format&fit=crop&q=60',
        large2x: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&auto=format&fit=crop&q=80',
        original: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb'
      },
      label: 'Autumn Valley Nature orange leaves trees river',
      category: 'nature'
    }
  ],
  education: [
    {
      id: 'ledu1',
      photographer: 'Blackboard Classroom',
      photographer_url: 'https://unsplash.com',
      url: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=1200&auto=format&fit=crop&q=80',
      src: {
        medium: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=600&auto=format&fit=crop&q=60',
        large2x: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=1200&auto=format&fit=crop&q=80',
        original: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe'
      },
      label: 'Blackboard chalk classroom school teacher education',
      category: 'education'
    },
    {
      id: 'ledu2',
      photographer: 'Library Books',
      photographer_url: 'https://unsplash.com',
      url: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=1200&auto=format&fit=crop&q=80',
      src: {
        medium: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=600&auto=format&fit=crop&q=60',
        large2x: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=1200&auto=format&fit=crop&q=80',
        original: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f'
      },
      label: 'Library books shelves reading study knowledge university',
      category: 'education'
    },
    {
      id: 'ledu3',
      photographer: 'Stack of Books',
      photographer_url: 'https://unsplash.com',
      url: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=1200&auto=format&fit=crop&q=80',
      src: {
        medium: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&auto=format&fit=crop&q=60',
        large2x: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=1200&auto=format&fit=crop&q=80',
        original: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6'
      },
      label: 'Stack of books study school test learn knowledge',
      category: 'education'
    },
    {
      id: 'ledu4',
      photographer: 'Writing Study Desk',
      photographer_url: 'https://unsplash.com',
      url: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=1200&auto=format&fit=crop&q=80',
      src: {
        medium: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&auto=format&fit=crop&q=60',
        large2x: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=1200&auto=format&fit=crop&q=80',
        original: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173'
      },
      label: 'Study desk writing pen notebook education classroom work',
      category: 'education'
    },
    {
      id: 'ledu5',
      photographer: 'Open Book Pages',
      photographer_url: 'https://unsplash.com',
      url: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=1200&auto=format&fit=crop&q=80',
      src: {
        medium: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600&auto=format&fit=crop&q=60',
        large2x: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=1200&auto=format&fit=crop&q=80',
        original: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8'
      },
      label: 'Open book pages reading literature study knowledge education',
      category: 'education'
    },
    {
      id: 'ledu6',
      photographer: 'Pencils Stationery',
      photographer_url: 'https://unsplash.com',
      url: 'https://images.unsplash.com/photo-1586769852836-bc069f19e1b6?w=1200&auto=format&fit=crop&q=80',
      src: {
        medium: 'https://images.unsplash.com/photo-1586769852836-bc069f19e1b6?w=600&auto=format&fit=crop&q=60',
        large2x: 'https://images.unsplash.com/photo-1586769852836-bc069f19e1b6?w=1200&auto=format&fit=crop&q=80',
        original: 'https://images.unsplash.com/photo-1586769852836-bc069f19e1b6'
      },
      label: 'Colorful pencils stationery school supplies art craft education',
      category: 'education'
    },
    {
      id: 'ledu7',
      photographer: 'Notebook & Pen',
      photographer_url: 'https://unsplash.com',
      url: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=1200&auto=format&fit=crop&q=80',
      src: {
        medium: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=600&auto=format&fit=crop&q=60',
        large2x: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=1200&auto=format&fit=crop&q=80',
        original: 'https://images.unsplash.com/photo-1455390582262-044cdead277a'
      },
      label: 'Notebook pen writing journal study notes stationery education',
      category: 'education'
    },
    {
      id: 'ledu8',
      photographer: 'Motivational Quote Board',
      photographer_url: 'https://unsplash.com',
      url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&auto=format&fit=crop&q=80',
      src: {
        medium: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=60',
        large2x: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&auto=format&fit=crop&q=80',
        original: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3'
      },
      label: 'Motivational inspirational quote digital learning education technology',
      category: 'education'
    },
    {
      id: 'ledu9',
      photographer: 'Globe Geography',
      photographer_url: 'https://unsplash.com',
      url: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=1200&auto=format&fit=crop&q=80',
      src: {
        medium: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=600&auto=format&fit=crop&q=60',
        large2x: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=1200&auto=format&fit=crop&q=80',
        original: 'https://images.unsplash.com/photo-1532012197267-da84d127e765'
      },
      label: 'Books globe geography world knowledge school education',
      category: 'education'
    },
    {
      id: 'ledu10',
      photographer: 'Coloured Crayons',
      photographer_url: 'https://unsplash.com',
      url: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=1200&auto=format&fit=crop&q=80',
      src: {
        medium: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=600&auto=format&fit=crop&q=60',
        large2x: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=1200&auto=format&fit=crop&q=80',
        original: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634'
      },
      label: 'Coloured crayons stationery art school supplies drawing creativity',
      category: 'education'
    },
    {
      id: 'ledu11',
      photographer: 'Graduation Cap',
      photographer_url: 'https://unsplash.com',
      url: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1200&auto=format&fit=crop&q=80',
      src: {
        medium: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=600&auto=format&fit=crop&q=60',
        large2x: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1200&auto=format&fit=crop&q=80',
        original: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f'
      },
      label: 'Graduation cap degree university achievement success education',
      category: 'education'
    },
    {
      id: 'ledu12',
      photographer: 'Science Lab Beakers',
      photographer_url: 'https://unsplash.com',
      url: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=1200&auto=format&fit=crop&q=80',
      src: {
        medium: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=600&auto=format&fit=crop&q=60',
        large2x: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=1200&auto=format&fit=crop&q=80',
        original: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69'
      },
      label: 'Science lab beakers chemistry experiment school education',
      category: 'education'
    },
    {
      id: 'ledu13',
      photographer: 'Calculator Mathematics',
      photographer_url: 'https://unsplash.com',
      url: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=1200&auto=format&fit=crop&q=80',
      src: {
        medium: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=600&auto=format&fit=crop&q=60',
        large2x: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=1200&auto=format&fit=crop&q=80',
        original: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3'
      },
      label: 'Calculator mathematics numbers math school stationery education',
      category: 'education'
    },
    {
      id: 'ledu14',
      photographer: 'Apple on Books',
      photographer_url: 'https://unsplash.com',
      url: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1200&auto=format&fit=crop&q=80',
      src: {
        medium: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&auto=format&fit=crop&q=60',
        large2x: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1200&auto=format&fit=crop&q=80',
        original: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b'
      },
      label: 'Apple red books teacher school desk classic education knowledge',
      category: 'education'
    }
  ],
  gaming: [
    {
      id: 'lgam1',
      photographer: 'Neon Gaming',
      photographer_url: 'https://unsplash.com',
      url: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=1200&auto=format&fit=crop&q=80',
      src: {
        medium: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=600&auto=format&fit=crop&q=60',
        large2x: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=1200&auto=format&fit=crop&q=80',
        original: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc'
      },
      label: 'Neon Keyboard setup gaming pc gamer console',
      category: 'gaming'
    },
    {
      id: 'lgam2',
      photographer: 'Game Controller',
      photographer_url: 'https://unsplash.com',
      url: 'https://images.unsplash.com/photo-1612287230202-1bf1d85d1bdf?w=1200&auto=format&fit=crop&q=80',
      src: {
        medium: 'https://images.unsplash.com/photo-1612287230202-1bf1d85d1bdf?w=600&auto=format&fit=crop&q=60',
        large2x: 'https://images.unsplash.com/photo-1612287230202-1bf1d85d1bdf?w=1200&auto=format&fit=crop&q=80',
        original: 'https://images.unsplash.com/photo-1612287230202-1bf1d85d1bdf'
      },
      label: 'Console Controller gaming playstation play xbox switch',
      category: 'gaming'
    },
    {
      id: 'lgam3',
      photographer: 'RGB Keyboard',
      photographer_url: 'https://unsplash.com',
      url: 'https://images.unsplash.com/photo-1600861195091-690c92f1d2cc?w=1200&auto=format&fit=crop&q=80',
      src: {
        medium: 'https://images.unsplash.com/photo-1600861195091-690c92f1d2cc?w=600&auto=format&fit=crop&q=60',
        large2x: 'https://images.unsplash.com/photo-1600861195091-690c92f1d2cc?w=1200&auto=format&fit=crop&q=80',
        original: 'https://images.unsplash.com/photo-1600861195091-690c92f1d2cc'
      },
      label: 'RGB Keyboard gaming setup mechanical lights',
      category: 'gaming'
    }
  ],
  flowers: [
    {
      id: 'lflo1',
      photographer: 'Red Rose',
      photographer_url: 'https://unsplash.com',
      url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&auto=format&fit=crop&q=80',
      src: {
        medium: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=60',
        large2x: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&auto=format&fit=crop&q=80',
        original: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23'
      },
      label: 'Red Rose rose flowers garden beautiful plant romantic',
      category: 'flowers'
    },
    {
      id: 'lflo2',
      photographer: 'Yellow Tulips',
      photographer_url: 'https://unsplash.com',
      url: 'https://images.unsplash.com/photo-1520763185298-1b434c919102?w=1200&auto=format&fit=crop&q=80',
      src: {
        medium: 'https://images.unsplash.com/photo-1520763185298-1b434c919102?w=600&auto=format&fit=crop&q=60',
        large2x: 'https://images.unsplash.com/photo-1520763185298-1b434c919102?w=1200&auto=format&fit=crop&q=80',
        original: 'https://images.unsplash.com/photo-1520763185298-1b434c919102'
      },
      label: 'Yellow Tulip tulips flowers field spring blossom',
      category: 'flowers'
    },
    {
      id: 'lflo3',
      photographer: 'Helianthus Sunflower',
      photographer_url: 'https://unsplash.com',
      url: 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?w=1200&auto=format&fit=crop&q=80',
      src: {
        medium: 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?w=600&auto=format&fit=crop&q=60',
        large2x: 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?w=1200&auto=format&fit=crop&q=80',
        original: 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651'
      },
      label: 'Sunflower sunflowers flowers field sun summer plant',
      category: 'flowers'
    },
    {
      id: 'lflo4',
      photographer: 'Pond Lilies',
      photographer_url: 'https://unsplash.com',
      url: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=1200&auto=format&fit=crop&q=80',
      src: {
        medium: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=600&auto=format&fit=crop&q=60',
        large2x: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=1200&auto=format&fit=crop&q=80',
        original: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9'
      },
      label: 'White Lily lilies flowers pond spring water',
      category: 'flowers'
    },
    {
      id: 'lflo5',
      photographer: 'Purple Orchids',
      photographer_url: 'https://unsplash.com',
      url: 'https://images.unsplash.com/photo-1525310072745-f49212b5ac6d?w=1200&auto=format&fit=crop&q=80',
      src: {
        medium: 'https://images.unsplash.com/photo-1525310072745-f49212b5ac6d?w=600&auto=format&fit=crop&q=60',
        large2x: 'https://images.unsplash.com/photo-1525310072745-f49212b5ac6d?w=1200&auto=format&fit=crop&q=80',
        original: 'https://images.unsplash.com/photo-1525310072745-f49212b5ac6d'
      },
      label: 'Pink Orchid orchids flowers beauty tropical plant exotic',
      category: 'flowers'
    },
    {
      id: 'lflo6',
      photographer: 'Lavender Hills',
      photographer_url: 'https://unsplash.com',
      url: 'https://images.unsplash.com/photo-1528183429752-a97d0bf99b5a?w=1200&auto=format&fit=crop&q=80',
      src: {
        medium: 'https://images.unsplash.com/photo-1528183429752-a97d0bf99b5a?w=600&auto=format&fit=crop&q=60',
        large2x: 'https://images.unsplash.com/photo-1528183429752-a97d0bf99b5a?w=1200&auto=format&fit=crop&q=80',
        original: 'https://images.unsplash.com/photo-1528183429752-a97d0bf99b5a'
      },
      label: 'Lavender lavender flowers purple field aroma plant hills',
      category: 'flowers'
    }
  ],
  birds: [
    {
      id: 'lbir1',
      photographer: 'Indian Peacock',
      photographer_url: 'https://unsplash.com',
      url: 'https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=1200&auto=format&fit=crop&q=80',
      src: {
        medium: 'https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=600&auto=format&fit=crop&q=60',
        large2x: 'https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=1200&auto=format&fit=crop&q=80',
        original: 'https://images.unsplash.com/photo-1516467508483-a7212febe31a'
      },
      label: 'Peacock peacock beautiful feathers bird plumage tail',
      category: 'birds'
    },
    {
      id: 'lbir2',
      photographer: 'Macaw Parrot',
      photographer_url: 'https://unsplash.com',
      url: 'https://images.unsplash.com/photo-1452570053594-1b985d6ea890?w=1200&auto=format&fit=crop&q=80',
      src: {
        medium: 'https://images.unsplash.com/photo-1452570053594-1b985d6ea890?w=600&auto=format&fit=crop&q=60',
        large2x: 'https://images.unsplash.com/photo-1452570053594-1b985d6ea890?w=1200&auto=format&fit=crop&q=80',
        original: 'https://images.unsplash.com/photo-1452570053594-1b985d6ea890'
      },
      label: 'Macaw Parrot parrot colorful feathers bird tropical animal',
      category: 'birds'
    },
    {
      id: 'lbir3',
      photographer: 'American Flamingo',
      photographer_url: 'https://unsplash.com',
      url: 'https://images.unsplash.com/photo-1510797215324-95af8974a493?w=1200&auto=format&fit=crop&q=80',
      src: {
        medium: 'https://images.unsplash.com/photo-1510797215324-95af8974a493?w=600&auto=format&fit=crop&q=60',
        large2x: 'https://images.unsplash.com/photo-1510797215324-95af8974a493?w=1200&auto=format&fit=crop&q=80',
        original: 'https://images.unsplash.com/photo-1510797215324-95af8974a493'
      },
      label: 'Flamingo flamingos pink lake water bird wildlife nature',
      category: 'birds'
    },
    {
      id: 'lbir4',
      photographer: 'Forest Owl',
      photographer_url: 'https://unsplash.com',
      url: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=1200&auto=format&fit=crop&q=80',
      src: {
        medium: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=600&auto=format&fit=crop&q=60',
        large2x: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=1200&auto=format&fit=crop&q=80',
        original: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9'
      },
      label: 'Owl owl hunter eyes tree bird forest branch predator',
      category: 'birds'
    },
    {
      id: 'lbir5',
      photographer: 'Blue Kingfisher',
      photographer_url: 'https://unsplash.com',
      url: 'https://images.unsplash.com/photo-1611599537845-1c7aca0091c0?w=1200&auto=format&fit=crop&q=80',
      src: {
        medium: 'https://images.unsplash.com/photo-1611599537845-1c7aca0091c0?w=600&auto=format&fit=crop&q=60',
        large2x: 'https://images.unsplash.com/photo-1611599537845-1c7aca0091c0?w=1200&auto=format&fit=crop&q=80',
        original: 'https://images.unsplash.com/photo-1611599537845-1c7aca0091c0'
      },
      label: 'Kingfisher kingfisher color feathers bird branch river fish',
      category: 'birds'
    },
    {
      id: 'lbir6',
      photographer: 'Lake Swan',
      photographer_url: 'https://unsplash.com',
      url: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=1200&auto=format&fit=crop&q=80',
      src: {
        medium: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=600&auto=format&fit=crop&q=60',
        large2x: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=1200&auto=format&fit=crop&q=80',
        original: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2'
      },
      label: 'Swan swan white pond lake bird water grace river',
      category: 'birds'
    }
  ],
  food: [
    {
      id: 'lfoo1',
      photographer: 'Cheese Pizza',
      photographer_url: 'https://unsplash.com',
      url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1200&auto=format&fit=crop&q=80',
      src: {
        medium: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop&q=60',
        large2x: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1200&auto=format&fit=crop&q=80',
        original: 'https://images.unsplash.com/photo-1513104890138-7c749659a591'
      },
      label: 'Pizza cheese slices hot pepperoni tasty food only no people no background',
      category: 'food'
    },
    {
      id: 'lfoo2',
      photographer: 'Gourmet Burger',
      photographer_url: 'https://unsplash.com',
      url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=1200&auto=format&fit=crop&q=80',
      src: {
        medium: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=60',
        large2x: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=1200&auto=format&fit=crop&q=80',
        original: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd'
      },
      label: 'Burger cheese bun meat salad yummy food only no people no background',
      category: 'food'
    },
    {
      id: 'lfoo3',
      photographer: 'Sushi rolls',
      photographer_url: 'https://unsplash.com',
      url: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=1200&auto=format&fit=crop&q=80',
      src: {
        medium: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=600&auto=format&fit=crop&q=60',
        large2x: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=1200&auto=format&fit=crop&q=80',
        original: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c'
      },
      label: 'Sushi rolls salmon plate restaurant japanese food only no people no background',
      category: 'food'
    },
    {
      id: 'lfoo4',
      photographer: 'Spaghetti Pasta',
      photographer_url: 'https://unsplash.com',
      url: 'https://images.unsplash.com/photo-1563379971899-660589a01cf3?w=1200&auto=format&fit=crop&q=80',
      src: {
        medium: 'https://images.unsplash.com/photo-1563379971899-660589a01cf3?w=600&auto=format&fit=crop&q=60',
        large2x: 'https://images.unsplash.com/photo-1563379971899-660589a01cf3?w=1200&auto=format&fit=crop&q=80',
        original: 'https://images.unsplash.com/photo-1563379971899-660589a01cf3'
      },
      label: 'Pasta spaghetti sauce cheese italian food only no people no background',
      category: 'food'
    },
    {
      id: 'lfoo5',
      photographer: 'Glazed Donuts',
      photographer_url: 'https://unsplash.com',
      url: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=1200&auto=format&fit=crop&q=80',
      src: {
        medium: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=600&auto=format&fit=crop&q=60',
        large2x: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=1200&auto=format&fit=crop&q=80',
        original: 'https://images.unsplash.com/photo-1551024601-bec78aea704b'
      },
      label: 'Donuts glazed chocolate colorful dessert bakery food only no people no background',
      category: 'food'
    },
    {
      id: 'lfoo6',
      photographer: 'Crispy Tacos',
      photographer_url: 'https://unsplash.com',
      url: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=1200&auto=format&fit=crop&q=80',
      src: {
        medium: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600&auto=format&fit=crop&q=60',
        large2x: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=1200&auto=format&fit=crop&q=80',
        original: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47'
      },
      label: 'Tacos wrap meat salad spicy mexican food only no people no background',
      category: 'food'
    }
  ],
  space: [
    {
      id: 'lspa1',
      photographer: 'Deep Cosmos',
      photographer_url: 'https://unsplash.com',
      url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&auto=format&fit=crop&q=80',
      src: {
        medium: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&auto=format&fit=crop&q=60',
        large2x: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&auto=format&fit=crop&q=80',
        original: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa'
      },
      label: 'Deep Cosmos galaxy stars space astronomy planet',
      category: 'space'
    },
    {
      id: 'lspa2',
      photographer: 'Starry Sky',
      photographer_url: 'https://unsplash.com',
      url: 'https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?w=1200&auto=format&fit=crop&q=80',
      src: {
        medium: 'https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?w=600&auto=format&fit=crop&q=60',
        large2x: 'https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?w=1200&auto=format&fit=crop&q=80',
        original: 'https://images.unsplash.com/photo-1506318137071-a8e063b4bec0'
      },
      label: 'Starry Sky stars nebula cosmos space science',
      category: 'space'
    }
  ],
  technology: [
    {
      id: 'ltec1',
      photographer: 'Laptop Workspace',
      photographer_url: 'https://unsplash.com',
      url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=1200&auto=format&fit=crop&q=80',
      src: {
        medium: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop&q=60',
        large2x: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=1200&auto=format&fit=crop&q=80',
        original: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8'
      },
      label: 'Laptop Macbook Pro sleek aluminum modern computer technology workspace',
      category: 'technology'
    },
    {
      id: 'ltec2',
      photographer: 'Futuristic AI Robot',
      photographer_url: 'https://unsplash.com',
      url: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1200&auto=format&fit=crop&q=80',
      src: {
        medium: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=600&auto=format&fit=crop&q=60',
        large2x: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1200&auto=format&fit=crop&q=80',
        original: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e'
      },
      label: 'AI Robot robotics artificial intelligence futuristic technology humanoid computer',
      category: 'technology'
    },
    {
      id: 'ltec3',
      photographer: 'Developer Coding Setup',
      photographer_url: 'https://unsplash.com',
      url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&auto=format&fit=crop&q=80',
      src: {
        medium: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=60',
        large2x: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&auto=format&fit=crop&q=80',
        original: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c'
      },
      label: 'Developer coding setup code editor programming monitors workstation software computer',
      category: 'technology'
    },
    {
      id: 'ltec4',
      photographer: 'Gaming PC Workstation',
      photographer_url: 'https://unsplash.com',
      url: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=1200&auto=format&fit=crop&q=80',
      src: {
        medium: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=600&auto=format&fit=crop&q=60',
        large2x: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=1200&auto=format&fit=crop&q=80',
        original: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7'
      },
      label: 'Gaming PC setup workstation modern dual monitor desk setup computer tech',
      category: 'technology'
    }
  ],
  robots: [
    {
      id: 'lrob1',
      photographer: 'Pepper Humanoid Robot',
      photographer_url: 'https://unsplash.com',
      url: 'https://images.unsplash.com/photo-1531746790731-6c087fecd65a?w=1200&auto=format&fit=crop&q=80',
      src: {
        medium: 'https://images.unsplash.com/photo-1531746790731-6c087fecd65a?w=600&auto=format&fit=crop&q=60',
        large2x: 'https://images.unsplash.com/photo-1531746790731-6c087fecd65a?w=1200&auto=format&fit=crop&q=80',
        original: 'https://images.unsplash.com/photo-1531746790731-6c087fecd65a'
      },
      label: 'Pepper humanoid white robot android machine AI assistant technology',
      category: 'robots'
    },
    {
      id: 'lrob2',
      photographer: '3D Humanoid AI Robot',
      photographer_url: 'https://unsplash.com',
      url: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1200&auto=format&fit=crop&q=80',
      src: {
        medium: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=600&auto=format&fit=crop&q=60',
        large2x: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1200&auto=format&fit=crop&q=80',
        original: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e'
      },
      label: '3D humanoid robot figure android machine artificial intelligence futuristic',
      category: 'robots'
    },
    {
      id: 'lrob3',
      photographer: 'Industrial Robotic Arm',
      photographer_url: 'https://unsplash.com',
      url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80',
      src: {
        medium: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=60',
        large2x: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80',
        original: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe'
      },
      label: 'Robotic arm industrial factory automation machine manufacturing robot',
      category: 'robots'
    },
    {
      id: 'lrob4',
      photographer: 'Neon Cyborg AI Head',
      photographer_url: 'https://unsplash.com',
      url: 'https://images.unsplash.com/photo-1614741118887-7a4ee193a5fa?w=1200&auto=format&fit=crop&q=80',
      src: {
        medium: 'https://images.unsplash.com/photo-1614741118887-7a4ee193a5fa?w=600&auto=format&fit=crop&q=60',
        large2x: 'https://images.unsplash.com/photo-1614741118887-7a4ee193a5fa?w=1200&auto=format&fit=crop&q=80',
        original: 'https://images.unsplash.com/photo-1614741118887-7a4ee193a5fa'
      },
      label: 'Glowing neon cyborg robot head AI artificial intelligence android face cybernetic',
      category: 'robots'
    },
    {
      id: 'lrob5',
      photographer: 'Sci-Fi Mech Robot',
      photographer_url: 'https://unsplash.com',
      url: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=1200&auto=format&fit=crop&q=80',
      src: {
        medium: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=600&auto=format&fit=crop&q=60',
        large2x: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=1200&auto=format&fit=crop&q=80',
        original: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485'
      },
      label: 'Sci-Fi mech robot android figure cyberpunk futuristic machine',
      category: 'robots'
    },
    {
      id: 'lrob6',
      photographer: 'Factory Robot Line',
      photographer_url: 'https://unsplash.com',
      url: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=1200&auto=format&fit=crop&q=80',
      src: {
        medium: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=600&auto=format&fit=crop&q=60',
        large2x: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=1200&auto=format&fit=crop&q=80',
        original: 'https://images.unsplash.com/photo-1563986768609-322da13575f3'
      },
      label: 'Factory robot arm assembly line automation industrial machine manufacturing',
      category: 'robots'
    },
    {
      id: 'lrob7',
      photographer: 'Robot Blue LED Eyes',
      photographer_url: 'https://unsplash.com',
      url: 'https://images.unsplash.com/photo-1507146426996-ef05306b995a?w=1200&auto=format&fit=crop&q=80',
      src: {
        medium: 'https://images.unsplash.com/photo-1507146426996-ef05306b995a?w=600&auto=format&fit=crop&q=60',
        large2x: 'https://images.unsplash.com/photo-1507146426996-ef05306b995a?w=1200&auto=format&fit=crop&q=80',
        original: 'https://images.unsplash.com/photo-1507146426996-ef05306b995a'
      },
      label: 'Robot blue LED glowing eyes machine android cybernetic technology',
      category: 'robots'
    },
    {
      id: 'lrob8',
      photographer: 'Robotic Hand Touch',
      photographer_url: 'https://unsplash.com',
      url: 'https://images.unsplash.com/photo-1534723452862-4c874018d66d?w=1200&auto=format&fit=crop&q=80',
      src: {
        medium: 'https://images.unsplash.com/photo-1534723452862-4c874018d66d?w=600&auto=format&fit=crop&q=60',
        large2x: 'https://images.unsplash.com/photo-1534723452862-4c874018d66d?w=1200&auto=format&fit=crop&q=80',
        original: 'https://images.unsplash.com/photo-1534723452862-4c874018d66d'
      },
      label: 'Robotic metal hand touching finger robot machine AI connection',
      category: 'robots'
    },
    {
      id: 'lrob9',
      photographer: 'Cybernetic Chrome Skull',
      photographer_url: 'https://unsplash.com',
      url: 'https://images.unsplash.com/photo-1535378917042-10a22c95931a?w=1200&auto=format&fit=crop&q=80',
      src: {
        medium: 'https://images.unsplash.com/photo-1535378917042-10a22c95931a?w=600&auto=format&fit=crop&q=60',
        large2x: 'https://images.unsplash.com/photo-1535378917042-10a22c95931a?w=1200&auto=format&fit=crop&q=80',
        original: 'https://images.unsplash.com/photo-1535378917042-10a22c95931a'
      },
      label: 'Chrome metallic cybernetic robot skull machine android technology',
      category: 'robots'
    },
    {
      id: 'lrob10',
      photographer: 'AI Digital Network Brain',
      photographer_url: 'https://unsplash.com',
      url: 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?w=1200&auto=format&fit=crop&q=80',
      src: {
        medium: 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?w=600&auto=format&fit=crop&q=60',
        large2x: 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?w=1200&auto=format&fit=crop&q=80',
        original: 'https://images.unsplash.com/photo-1507413245164-6160d8298b31'
      },
      label: 'AI digital brain network neural machine learning robot technology',
      category: 'robots'
    },
    {
      id: 'lrob11',
      photographer: 'Robot Dog Boston Dynamics',
      photographer_url: 'https://unsplash.com',
      url: 'https://images.unsplash.com/photo-1546776310-eef45dd6d63c?w=1200&auto=format&fit=crop&q=80',
      src: {
        medium: 'https://images.unsplash.com/photo-1546776310-eef45dd6d63c?w=600&auto=format&fit=crop&q=60',
        large2x: 'https://images.unsplash.com/photo-1546776310-eef45dd6d63c?w=1200&auto=format&fit=crop&q=80',
        original: 'https://images.unsplash.com/photo-1546776310-eef45dd6d63c'
      },
      label: 'Robotic dog quadruped machine autonomous robot four-legged technology',
      category: 'robots'
    },
    {
      id: 'lrob12',
      photographer: 'Futuristic Mech Armor',
      photographer_url: 'https://unsplash.com',
      url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1200&auto=format&fit=crop&q=80',
      src: {
        medium: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=60',
        large2x: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1200&auto=format&fit=crop&q=80',
        original: 'https://images.unsplash.com/photo-1578632767115-351597cf2477'
      },
      label: 'Futuristic mech robot warrior armor suit machine sci-fi android',
      category: 'robots'
    },
    {
      id: 'lrob13',
      photographer: 'Cyberpunk 3D Android',
      photographer_url: 'https://unsplash.com',
      url: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=1200&auto=format&fit=crop&q=80',
      src: {
        medium: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=600&auto=format&fit=crop&q=60',
        large2x: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=1200&auto=format&fit=crop&q=80',
        original: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675'
      },
      label: '3D cyberpunk android robot figure futuristic machine digital art',
      category: 'robots'
    },
    {
      id: 'lrob14',
      photographer: 'Automated Manufacturing Robot',
      photographer_url: 'https://unsplash.com',
      url: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1200&auto=format&fit=crop&q=80',
      src: {
        medium: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&auto=format&fit=crop&q=60',
        large2x: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1200&auto=format&fit=crop&q=80',
        original: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158'
      },
      label: 'Automated manufacturing industrial robot arm machine production line technology',
      category: 'robots'
    },
    {
      id: 'lrob15',
      photographer: 'White Service Robot',
      photographer_url: 'https://unsplash.com',
      url: 'https://images.unsplash.com/photo-1589254065878-42c9da997008?w=1200&auto=format&fit=crop&q=80',
      src: {
        medium: 'https://images.unsplash.com/photo-1589254065878-42c9da997008?w=600&auto=format&fit=crop&q=60',
        large2x: 'https://images.unsplash.com/photo-1589254065878-42c9da997008?w=1200&auto=format&fit=crop&q=80',
        original: 'https://images.unsplash.com/photo-1589254065878-42c9da997008'
      },
      label: 'White service robot machine humanoid android AI assistant helper technology',
      category: 'robots'
    },
    {
      id: 'lrob16',
      photographer: 'Robotic Drone Hovering',
      photographer_url: 'https://unsplash.com',
      url: 'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=1200&auto=format&fit=crop&q=80',
      src: {
        medium: 'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=600&auto=format&fit=crop&q=60',
        large2x: 'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=1200&auto=format&fit=crop&q=80',
        original: 'https://images.unsplash.com/photo-1527977966376-1c8408f9f108'
      },
      label: 'Robotic drone hovering flight machine autonomous AI technology robot',
      category: 'robots'
    }
  ]
};

const INAPPROPRIATE_KEYWORDS = [
  'nude', 'nudes', 'naked', 'bikini', 'bikinis', 'swimsuit', 'swimwear', 'lingerie', 
  'underwear', 'topless', 'erotic', 'nsfw', 'adult', 'cleavage', 'sexy', 
  'babe', 'sensual', 'playboy', 'boobs', 'butt', 'breast', 'bust', 'thong', 
  'panties', 'bra', 'strip', 'porn', 'xxx', 'sex', 'erotica', 'nude art', 'nude photography',
  'ted van pelt', 'water ski', 'water skiing', 'vintage swimsuit', 'retro swimsuit', 'old swimsuit photo',
  'sam droege', 'droege', 'insect', 'insects', 'grasshopper', 'locust', 'gryllidae', 'cicada', 'macro insect', 'bug', 'bugs', 'cockroach', 'beetle'
];

const isContentInappropriate = (text) => {
  if (!text) return false;
  const lower = String(text).toLowerCase();
  return INAPPROPRIATE_KEYWORDS.some(kw => lower.includes(kw));
};

const getLocalImages = (cat, query) => {
  const q = (query || '').toLowerCase().trim();
  
  if (isContentInappropriate(q)) {
    return [];
  }

  const filterSafe = (list) => (list || []).filter(img => !isContentInappropriate(`${img.label || ''} ${img.url || ''} ${img.category || ''}`));
  
  if (q) {
    if (q.includes('robot') || q.includes('android') || q.includes('humanoid') || q.includes('cyborg') || q.includes('mech') || q.includes('robotic')) {
      return filterSafe(LOCAL_PIXEL_LIBRARY.robots);
    }
    if (q.includes('coffee') || q.includes('espresso') || q.includes('latte') || q.includes('cafe') || q.includes('bean') || q.includes('cappuccino')) {
      return filterSafe(LOCAL_PIXEL_LIBRARY.coffee);
    }
    if (q.includes('flower') || q.includes('rose') || q.includes('tulip') || q.includes('sunflower') || q.includes('lily') || q.includes('orchid') || q.includes('lavender') || q.includes('daisy')) {
      return filterSafe(LOCAL_PIXEL_LIBRARY.flowers);
    }
    if (q.includes('bird') || q.includes('peacock') || q.includes('parrot') || q.includes('flamingo') || q.includes('owl') || q.includes('kingfisher') || q.includes('swan') || q.includes('eagle')) {
      return filterSafe(LOCAL_PIXEL_LIBRARY.birds);
    }
    if (q.includes('food') || q.includes('pizza') || q.includes('burger') || q.includes('sushi') || q.includes('pasta') || q.includes('tacos') || q.includes('donut') || q.includes('dessert')) {
      return filterSafe(LOCAL_PIXEL_LIBRARY.food);
    }
    if (q.includes('game') || q.includes('gaming') || q.includes('neon') || q.includes('console') || q.includes('keyboard')) {
      return filterSafe(LOCAL_PIXEL_LIBRARY.gaming);
    }
    if (q.includes('space') || q.includes('cosmos') || q.includes('galaxy') || q.includes('nebula') || q.includes('planet') || q.includes('star')) {
      return filterSafe(LOCAL_PIXEL_LIBRARY.space);
    }
    if (q.includes('tech') || q.includes('laptop') || q.includes('computer') || q.includes('coding') || q.includes('code') || q.includes('ai')) {
      return filterSafe(LOCAL_PIXEL_LIBRARY.technology);
    }
    if (q.includes('nature') || q.includes('beach') || q.includes('mountain') || q.includes('forest') || q.includes('meadow') || q.includes('desert') || q.includes('lake') || q.includes('autumn')) {
      return filterSafe(LOCAL_PIXEL_LIBRARY.nature);
    }
    if (q.includes('edu') || q.includes('book') || q.includes('library') || q.includes('study') || q.includes('class') || q.includes('school')) {
      return filterSafe(LOCAL_PIXEL_LIBRARY.education);
    }

    const allImages = Object.values(LOCAL_PIXEL_LIBRARY).flat();
    return filterSafe(allImages.filter(img => 
      (img.label || '').toLowerCase().includes(q) || 
      (img.category || '').toLowerCase().includes(q)
    ));
  }

  if (cat === 'all') {
    return filterSafe([
      ...LOCAL_PIXEL_LIBRARY.robots.slice(0, 2),
      ...LOCAL_PIXEL_LIBRARY.coffee.slice(0, 2),
      ...LOCAL_PIXEL_LIBRARY.technology.slice(0, 2),
      ...LOCAL_PIXEL_LIBRARY.nature.slice(0, 2),
      ...LOCAL_PIXEL_LIBRARY.flowers.slice(0, 2),
      ...LOCAL_PIXEL_LIBRARY.food.slice(0, 2),
      ...LOCAL_PIXEL_LIBRARY.birds.slice(0, 2),
      ...LOCAL_PIXEL_LIBRARY.space.slice(0, 2),
      ...LOCAL_PIXEL_LIBRARY.gaming.slice(0, 2),
      ...LOCAL_PIXEL_LIBRARY.education.slice(0, 2)
    ]);
  }

  return filterSafe(LOCAL_PIXEL_LIBRARY[cat] || []);
};

const parseBgConfig = (bgStr) => {
  if (!bgStr) {
    return {
      url: '',
      blur: 0,
      brightness: 100,
      overlayOpacity: 30,
      gradientOverlay: 'none',
      gradientColor1: '#7c3aed',
      gradientColor2: '#06b6d4',
      position: 'center',
      fit: 'cover',
      darkOverlay: true
    };
  }
  try {
    let config = bgStr;
    // Recursively parse string if it's double serialized or nested JSON
    while (typeof config === 'string' && (config.trim().startsWith('{') || config.trim().startsWith('"'))) {
      const parsed = JSON.parse(config);
      if (typeof parsed === 'string' && parsed === config) {
        break; // Prevent infinite loop
      }
      config = parsed;
    }

    if (config && typeof config === 'object') {
      return {
        url: config.url || '',
        blur: typeof config.blur === 'number' ? config.blur : 0,
        brightness: typeof config.brightness === 'number' ? config.brightness : 100,
        overlayOpacity: typeof config.overlayOpacity === 'number' ? config.overlayOpacity : 30,
        gradientOverlay: config.gradientOverlay || 'none',
        gradientColor1: config.gradientColor1 || '#7c3aed',
        gradientColor2: config.gradientColor2 || '#06b6d4',
        position: config.position || 'center',
        fit: config.fit || 'cover',
        darkOverlay: config.darkOverlay !== undefined ? !!config.darkOverlay : true
      };
    }
  } catch (e) { }
  return {
    url: typeof bgStr === 'string' ? bgStr : (bgStr?.url || ''),
    blur: 0,
    brightness: 100,
    overlayOpacity: 30,
    gradientOverlay: 'none',
    gradientColor1: '#7c3aed',
    gradientColor2: '#06b6d4',
    position: 'center',
    fit: 'cover',
    darkOverlay: true
  };
};

const compressAndResizeImage = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const maxDimension = 1000;

        if (width > height) {
          if (width > maxDimension) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          }
        } else {
          if (height > maxDimension) {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Compress as JPEG with 0.6 quality (looks great for blurred backgrounds, extremely small size)
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.6);
        resolve(compressedBase64);
      };
      img.onerror = (err) => {
        reject(new Error('Failed to load image for compression'));
      };
      img.src = ev.target.result;
    };
    reader.onerror = (err) => {
      reject(err);
    };
    reader.readAsDataURL(file);
  });
};

// Maps each category chip id to SHORT (2-4 word) keyword phrases
// Openverse works best with concise queries — long strings cause low result counts
const CATEGORY_QUERIES = {
  trending:     'trending popular photography',
  technology:   'modern laptop computer coding software developer workstation',
  robots:       'humanoid robot machine android mech robotic',
  coffee:       'coffee espresso latte art cafe coffee beans',
  nature:       'nature landscape scenic',
  animals:      'animals wildlife',
  flowers:      'flowers blooms garden',
  birds:        'birds wildlife nature',
  fruits:       'fruits food colorful',
  food:         'food delicious cuisine',
  travel:       'travel destinations landmarks',
  gaming:       'gaming video games',
  cars:         'cars automobile vehicle',
  space:        'space galaxy cosmos',
  education:    'education books classroom stationery pen notebook motivational quote learning',
  business:     'business professional office',
  abstract:     'abstract art colorful',
  minimal:      'minimal clean simple',
  fantasy:      'fantasy magical mystical',
  architecture: 'architecture buildings design',
  backgrounds:  'background wallpaper scenic',
  textures:     'texture surface material',
  patterns:     'pattern geometric design',
  ocean:        'ocean sea waves',
  forest:       'forest trees woodland',
  mountain:     'mountain peaks alpine',
  cities:       'city urban skyline',
  art:          'art painting creative'
};

// Sub-category quick-search chips shown below main category chips
const SUB_CATEGORIES = {
  technology: ['Macbook Pro', 'Gaming PC Setup', 'Coding Screen', 'Cyberpunk Tech', 'Developer Workspace', 'Quantum Computing', 'Data Center', 'Tech Hardware', 'Smart Home', 'Virtual Reality'],
  education:  ['Books', 'Classroom', 'Stationery', 'Pencils', 'Notebook & Pen', 'Motivational Quote', 'Library', 'Graduation', 'Science Lab', 'Mathematics', 'Crayons', 'Globe', 'Study Desk', 'Blackboard', 'Telescope'],
  coffee:     ['Latte Art', 'Espresso Shot', 'Coffee Cup', 'Cappuccino', 'Coffee Beans', 'Cafe Vibe', 'Iced Coffee', 'Morning Coffee', 'Barista', 'Cold Brew', 'Roastery', 'Coffee Shop'],
  cities:     ['Paris', 'London', 'Tokyo', 'New York', 'Dubai', 'Sydney', 'Rome', 'Barcelona', 'Mumbai', 'Singapore', 'Istanbul', 'Bangkok'],
  animals:    ['Panda', 'Lion', 'Tiger', 'Elephant', 'Wolf', 'Dolphin', 'Gorilla', 'Cheetah', 'Giraffe', 'Zebra', 'Penguin', 'Fox'],
  fruits:     ['Mango', 'Apple', 'Strawberry', 'Orange', 'Banana', 'Watermelon', 'Grapes', 'Pineapple', 'Cherry', 'Coconut', 'Peach', 'Lemon'],
  flowers:    ['Rose', 'Sunflower', 'Tulip', 'Lavender', 'Orchid', 'Daisy', 'Lotus', 'Jasmine', 'Hibiscus', 'Poppy', 'Lily', 'Dahlia'],
  birds:      ['Peacock', 'Eagle', 'Parrot', 'Flamingo', 'Owl', 'Toucan', 'Humming Bird', 'Kingfisher', 'Sparrow', 'Pelican', 'Macaw', 'Crane'],
  food:       ['Pizza', 'Burger', 'Sushi', 'Ramen', 'Pasta', 'Biryani', 'Tacos', 'Ice Cream', 'Cake', 'Sandwich', 'Salad', 'Noodles'],
  cars:       ['Ferrari', 'Lamborghini', 'Mustang', 'Porsche', 'BMW', 'Mercedes', 'Bugatti', 'Rolls Royce', 'Jeep', 'Truck', 'Race Car', 'Motorcycle'],
  space:      ['Galaxy', 'Nebula', 'Astronaut', 'Mars', 'Moon', 'Milky Way', 'Black Hole', 'Comet', 'Saturn', 'Jupiter', 'Supernova', 'Aurora'],
  nature:     ['Sunset', 'Waterfall', 'Rainbow', 'Volcano', 'Desert', 'Glacier', 'River', 'Canyon', 'Cave', 'Meadow', 'Valley', 'Storm'],
  travel:     ['Eiffel Tower', 'Taj Mahal', 'Colosseum', 'Great Wall', 'Pyramids', 'Santorini', 'Maldives', 'Bali', 'Venice', 'Safari', 'Northern Lights', 'Machu Picchu'],
  gaming:     ['Minecraft', 'Fortnite', 'Pokemon', 'Mario', 'Zelda', 'Neon Setup', 'Game Controller', 'Esports', 'VR Gaming', 'Pixel Art', 'RPG'],
  ocean:      ['Coral Reef', 'Jellyfish', 'Shark', 'Whale', 'Turtle', 'Clownfish', 'Octopus', 'Manta Ray', 'Starfish', 'Seahorse', 'Blue Whale', 'Tropical Fish'],
  forest:     ['Redwood', 'Rainforest', 'Misty Forest', 'Bamboo', 'Pine Forest', 'Autumn Forest', 'Fireflies', 'Mushrooms', 'Mossy Trees', 'Forest Path', 'Tree Canopy', 'Jungle'],
  mountain:   ['Everest', 'Alps', 'Himalayas', 'Rocky Mountains', 'Dolomites', 'Snowpeak', 'Sunrise Mountain', 'Misty Mountain', 'Volcano', 'Ice Mountain', 'Canyon', 'Cliff'],
  art:        ['Oil Painting', 'Watercolor', 'Street Art', 'Graffiti', 'Sculpture', 'Abstract Painting', 'Portrait', 'Cubism', 'Digital Art', 'Illustration', 'Calligraphy', 'Mosaic'],
};

export default function BackgroundPicker({ value, onChange, showPreview = true, previewData }) {
  const config = parseBgConfig(value);
  const { themeMode } = useTheme();
  const isLight = themeMode === 'light';

    const defaultPreviewData = {};
  const pd = previewData || defaultPreviewData;
  const displayCategory = pd.category || 'Preview Category';
  const displayTime = pd.timeLimit || 20;
  const displayQuestion = pd.questionText || 'Question text...';
  const displayOptions = pd.options || ['Option 1', 'Option 2', 'Option 3', 'Option 4'];
  const displayCorrectAnswer = pd.correctAnswer || 0;

  const optionShapes = [
    <svg className="h-2.5 w-2.5 fill-white stroke-transparent shrink-0" viewBox="0 0 24 24" key="triangle"><path d="M12 3l10 17H2L12 3z" /></svg>,
    <svg className="h-2.5 w-2.5 fill-white stroke-transparent shrink-0 rotate-45" viewBox="0 0 24 24" key="diamond"><rect x="5" y="5" width="14" height="14" /></svg>,
    <div className="h-2.5 w-2.5 rounded-full bg-white shrink-0 shadow-sm" key="circle" />,
    <div className="h-2.5 w-2.5 rounded bg-white shrink-0 shadow-sm" key="square" />
  ];

  // Picker local UI states
  const [activeBgTab, setActiveBgTab] = useState('upload'); // 'upload' | 'pixels'
  const [isPexelsModalOpen, setIsPexelsModalOpen] = useState(false);
  const [previewDevice, setPreviewDevice] = useState('desktop'); // 'desktop' | 'mobile'
  const [searchQuery, setSearchQuery] = useState('');
  const [bgCategory, setBgCategory] = useState('Education');
  const [dragActive, setDragActive] = useState(false);

  // Body scroll lock effect for Pexels Library Portal Modal
  useEffect(() => {
    if (isPexelsModalOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isPexelsModalOpen]);

  // ESC key handler for Pexels Modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isPexelsModalOpen) {
        setIsPexelsModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPexelsModalOpen]);

  // Pixel Library States
  const [pixelSearchInput, setPixelSearchInput] = useState('');
  const [pixelQuery, setPixelQuery] = useState('');
  const [pixelCategory, setPixelCategory] = useState('all');
  const [pixelImages, setPixelImages] = useState([]);
  const [pixelLoading, setPixelLoading] = useState(false);
  const [pixelPage, setPixelPage] = useState(1);
  const [pixelHasMore, setPixelHasMore] = useState(true);
  const [pixelShowFavoritesOnly, setPixelShowFavoritesOnly] = useState(false);
  const [searchCache, setSearchCache] = useState({});

  // Canva-style rich features
  const [userPexelsKey, setUserPexelsKey] = useState(() => localStorage.getItem('user_pexels_api_key') || '');
  const [showSettingsPopup, setShowSettingsPopup] = useState(false);
  const [selectedImageForPreview, setSelectedImageForPreview] = useState(null);
  const [zoomScale, setZoomScale] = useState(1);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [bgAppliedConfirm, setBgAppliedConfirm] = useState(false);
  
  const [recentSearches, setRecentSearches] = useState(() => {
    try {
      const saved = localStorage.getItem('pixel_library_recent_searches');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [pixelFavorites, setPixelFavorites] = useState(() => {
    try {
      const saved = localStorage.getItem('pixel_library_favorites');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [pixelRecents, setPixelRecents] = useState(() => {
    try {
      const saved = localStorage.getItem('pixel_library_recents');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [homeLanesData, setHomeLanesData] = useState({
    trending: [],
    editorsChoice: [],
    popular: []
  });

  // Helper to fetch from backend proxy (which handles Pexels / SourceSplash / Picsum with CORS bypass)
  const fetchImagesFromApi = async (query, page, customKey) => {
    if (isContentInappropriate(query)) {
      toast.error('Explicit or inappropriate content search is blocked.');
      return { photos: [], hasMore: false };
    }

    try {
      // On Vercel/production: VITE_API_URL is set (e.g. https://gubbi-server.onrender.com)
      // On local dev: falls back to http://hostname:5000
      let baseUrl;
      if (import.meta.env.VITE_API_URL) {
        baseUrl = import.meta.env.VITE_API_URL.replace(/\/$/, '');
      } else {
        const { protocol, hostname } = window.location;
        baseUrl = `${protocol}//${hostname}:5000/api`;
      }
      const apiUrl = `${baseUrl}/images/search?q=${encodeURIComponent(query)}&page=${page}`;
      
      const headers = {};
      const pexelsKey = customKey || localStorage.getItem('user_pexels_api_key');
      if (pexelsKey) {
        headers['x-pexels-key'] = pexelsKey;
      }

      const res = await fetch(apiUrl, { headers });
      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.photos)) {
          data.photos = data.photos.filter(p => !isContentInappropriate(`${p.url || ''} ${p.photographer || ''} ${p.alt || ''}`));
        }
        return data;
      }
    } catch (e) {
      console.error('Frontend failed to fetch from backend proxy:', e.message);
    }
    return { photos: [], hasMore: false };
  };


  // Debounce search query input
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      const trimmed = pixelSearchInput.trim();
      if (isContentInappropriate(trimmed)) {
        toast.error('Search terms related to adult or explicit content are blocked.');
        setPixelQuery('');
        return;
      }
      setPixelQuery(trimmed);
      setPixelPage(1);
      
      if (trimmed) {
        setRecentSearches(prev => {
          const filtered = prev.filter(s => s.toLowerCase() !== trimmed.toLowerCase());
          const updated = [trimmed, ...filtered].slice(0, 20);
          localStorage.setItem('pixel_library_recent_searches', JSON.stringify(updated));
          return updated;
        });
      }
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [pixelSearchInput]);

  // Load home lanes once activeBgTab is 'pixels' or isPexelsModalOpen is true
  useEffect(() => {
    const loadHomeLanes = async () => {
      const trendingRes = await fetchImagesFromApi('', 1, userPexelsKey);
      const editorsChoiceRes = await fetchImagesFromApi('aesthetic', 1, userPexelsKey);
      const popularRes = await fetchImagesFromApi('minimalist', 1, userPexelsKey);
      
      setHomeLanesData({
        trending: (trendingRes.photos || []).filter(p => !isContentInappropriate(p.url)).slice(0, 12),
        editorsChoice: (editorsChoiceRes.photos || []).filter(p => !isContentInappropriate(p.url)).slice(0, 12),
        popular: (popularRes.photos || []).filter(p => !isContentInappropriate(p.url)).slice(0, 12)
      });
    };
    if (activeBgTab === 'pixels' || isPexelsModalOpen) {
      loadHomeLanes();
    }
  }, [activeBgTab, isPexelsModalOpen, userPexelsKey]);

  // Main search and category resolver Effect
  useEffect(() => {
    if ((activeBgTab !== 'pixels' && !isPexelsModalOpen) || pixelShowFavoritesOnly) return;
    
    // Empty search query & category all -> Home screen lists shown, grid is hidden
    if (!pixelQuery && pixelCategory === 'all') {
      setPixelImages([]);
      return;
    }

    const loadImages = async () => {
      if (isContentInappropriate(pixelQuery)) {
        setPixelImages([]);
        setPixelLoading(false);
        return;
      }

      setPixelLoading(true);
      const isLoadMore = pixelPage > 1;
      
      let q;
      if (pixelQuery) {
        q = pixelQuery;
      } else if (pixelCategory !== 'all') {
        q = CATEGORY_QUERIES[pixelCategory] || pixelCategory;
      } else {
        q = 'nature beautiful';
      }
      
      const cacheKey = `${q}-${pixelPage}`;
      if (!isLoadMore && searchCache[cacheKey]) {
        setPixelImages(searchCache[cacheKey].images);
        setPixelHasMore(searchCache[cacheKey].hasMore);
        setPixelLoading(false);
        return;
      }

      // Disambiguate robot searches to avoid conference/lecture photos
      const isRobotCategory = pixelCategory === 'robots' || /\brobot|\brobotic|\bandroid|\bhumanoid|\bcyborg|\bmech\b/i.test(q);
      const apiQuery = isRobotCategory
        ? 'humanoid robot machine android mech'
        : q;

      const res = await fetchImagesFromApi(apiQuery, pixelPage, userPexelsKey);
      let safePhotos = (res.photos || []).filter(p => !isContentInappropriate(`${p.url || ''} ${p.photographer || ''} ${p.alt || ''}`));

      // For robot searches: filter out conference/lecture/speaker photos
      if (isRobotCategory) {
        safePhotos = safePhotos.filter(p =>
          !/speaker|podium|lecture|conference|presentation|seminar|audience|crowd|microphone|professor|talk|panel|center for/i.test(
            `${p.alt || ''} ${p.photographer || ''}`
          )
        );
        // Prepend curated local robot images
        const localRobots = getLocalImages('robots', 'robot');
        if (localRobots.length > 0) {
          const localIds = new Set(localRobots.map(m => String(m.id)));
          safePhotos = [...localRobots, ...safePhotos.filter(p => !localIds.has(String(p.id)))];
        }
      }

      setPixelImages(prev => {
        const merged = isLoadMore ? [...prev, ...safePhotos] : safePhotos;
        setSearchCache(cache => ({
          ...cache,
          [cacheKey]: { images: merged, hasMore: res.hasMore }
        }));
        return merged;
      });
      setPixelHasMore(res.hasMore);
      setPixelLoading(false);
    };

    loadImages();
  }, [pixelQuery, pixelCategory, pixelPage, activeBgTab, isPexelsModalOpen, pixelShowFavoritesOnly, userPexelsKey]);


  const toggleFavorite = (image, e) => {
    if (e) e.stopPropagation();
    setPixelFavorites(prev => {
      const isFav = prev.some(item => item.id === image.id);
      let updated;
      if (isFav) {
        updated = prev.filter(item => item.id !== image.id);
        toast.success('Removed from favorites');
      } else {
        updated = [...prev, image];
        toast.success('Added to favorites! ❤️');
      }
      localStorage.setItem('pixel_library_favorites', JSON.stringify(updated));
      return updated;
    });
  };

  const addToRecents = (image) => {
    setPixelRecents(prev => {
      const filtered = prev.filter(item => item.id !== image.id);
      const updated = [image, ...filtered].slice(0, 20);
      localStorage.setItem('pixel_library_recents', JSON.stringify(updated));
      return updated;
    });
  };

  const updateField = (field, val) => {
    const newConfig = { ...config, [field]: val };
    onChange(JSON.stringify(newConfig));
  };

  const displayedImages = pixelShowFavoritesOnly ? pixelFavorites : pixelImages;

  return (
    <div className="grid gap-8 lg:grid-cols-12">
      {/* Left Column: Editor controls */}
      <div className={`${showPreview ? 'lg:col-span-7' : 'lg:col-span-12'} space-y-6 text-left`}>
        
        {/* Tab Navigation */}
        <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
          <button
            type="button"
            onClick={() => setActiveBgTab('upload')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              activeBgTab === 'upload'
                ? 'bg-primary text-white shadow-premium-glow'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <span className="flex items-center justify-center gap-1.5">
              <Upload className="h-3.5 w-3.5" />
              Upload Background
            </span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveBgTab('pixels');
              setIsPexelsModalOpen(true);
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              activeBgTab === 'pixels'
                ? 'bg-primary text-white shadow-premium-glow'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <span className="flex items-center justify-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5" />
              Pexels Library
            </span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="min-h-[220px] bg-white/[0.02] border border-white/5 rounded-2xl p-4 sm:p-5 relative">
          
          {/* TAB 2: UPLOAD BACKGROUND */}
          {activeBgTab === 'upload' && (
            <div className="space-y-4">
              <div
                onDragEnter={(e) => { e.preventDefault(); setDragActive(true); }}
                onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                onDragLeave={(e) => { e.preventDefault(); setDragActive(false); }}
                onDrop={async (e) => {
                  e.preventDefault();
                  setDragActive(false);
                  const file = e.dataTransfer.files?.[0];
                  if (file && ['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
                    const toastId = toast.loading('Processing and compressing background image...');
                    try {
                      const compressedUrl = await compressAndResizeImage(file);
                      updateField('url', compressedUrl);
                      toast.success(`Custom image "${file.name}" uploaded successfully!`, { id: toastId });
                    } catch (error) {
                      console.error('[IMAGE COMPRESSION ERROR]', error);
                      toast.error('Failed to compress image. Using raw upload.', { id: toastId });
                      // Fallback
                      const reader = new FileReader();
                      reader.onload = (ev) => {
                        updateField('url', ev.target.result);
                      };
                      reader.readAsDataURL(file);
                    }
                  } else {
                    toast.error('Please drop a valid JPG, PNG or WebP image file.');
                  }
                }}
                className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all ${
                  dragActive
                    ? 'border-primary bg-primary/5 scale-[0.99]'
                    : config.url.startsWith('data:')
                    ? 'border-green-500/35 bg-green-500/5'
                    : 'border-white/10 hover:border-white/20 hover:bg-white/[0.02]'
                }`}
              >
                <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                <p className="text-xs font-bold text-gray-300">Drag and drop your image here</p>
                <p className="text-[10px] text-gray-500 mt-1">Supports JPG, PNG, or WebP formats</p>
                <div className="mt-4 flex items-center justify-center gap-3">
                  <label className="btn-premium px-4 py-2 text-xs font-bold text-white cursor-pointer shadow-md"
                    style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', border: 'none' }}
                  >
                    Choose File
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const toastId = toast.loading('Processing and compressing background image...');
                          try {
                            const compressedUrl = await compressAndResizeImage(file);
                            updateField('url', compressedUrl);
                            toast.success(`Custom image "${file.name}" uploaded!`, { id: toastId });
                          } catch (error) {
                            console.error('[IMAGE COMPRESSION ERROR]', error);
                            toast.error('Failed to compress image. Using raw upload.', { id: toastId });
                            // Fallback
                            const reader = new FileReader();
                            reader.onload = (ev) => {
                              updateField('url', ev.target.result);
                            };
                            reader.readAsDataURL(file);
                          }
                        }
                      }}
                    />
                  </label>
                  {config.url && (
                    <button
                      type="button"
                      onClick={() => updateField('url', '')}
                      className="btn-premium px-4 py-2 text-xs font-bold text-white"
                      style={{ background: '#dc2626', border: 'none' }}
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PIXEL LIBRARY (IMAGE EXPLORER) PLACEHOLDER */}
          {activeBgTab === 'pixels' && (
            <div className="flex flex-col items-center justify-center p-6 text-center space-y-3 min-h-[220px]">
              <div className="p-3 rounded-full bg-primary/10 border border-primary/20 text-primary">
                <Sparkles className="h-6 w-6 animate-pulse" />
              </div>
              <div>
                <h4 className={`text-sm font-bold ${isLight ? 'text-gray-800' : 'text-white'}`}>Pexels Image Library</h4>
                <p className={`text-xs max-w-xs mt-1 ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>Browse millions of free HD stock photos without disrupting your editor layout.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsPexelsModalOpen(true)}
                className="btn-premium bg-primary px-5 py-2.5 text-xs font-bold text-white shadow-premium-glow flex items-center gap-2 cursor-pointer"
              >
                <Sparkles className="h-4 w-4" />
                <span>Open Pexels Library</span>
              </button>
            </div>
          )}
        </div>

        {/* PEXELS LIBRARY PORTAL MODAL (REMOVED FROM NORMAL DOCUMENT FLOW) */}
        {isPexelsModalOpen && createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md p-0 sm:p-6 overflow-hidden">
            <div className={`${isLight ? 'bg-white border-gray-200' : 'bg-[#121216] border-white/10'} border-0 sm:border rounded-none sm:rounded-2xl w-full max-w-5xl h-full sm:h-[88vh] flex flex-col shadow-2xl overflow-hidden relative text-left`}>
              
              {/* Modal Header */}
              <div className={`flex items-center justify-between px-6 py-4 border-b ${isLight ? 'border-gray-200 bg-gray-50' : 'border-white/10 bg-[#18181f]'} shrink-0`}>
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-primary/20 border border-primary/30 text-primary">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className={`text-base font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>Pexels Image Library</h3>
                    <p className={`text-[11px] ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>Search & select millions of free high-resolution stock photos</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsPexelsModalOpen(false)}
                  className={`p-2 rounded-xl border transition-all cursor-pointer ${isLight ? 'bg-gray-100 border-gray-200 text-gray-500 hover:text-gray-900 hover:bg-gray-200' : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10'}`}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Scrollable Modal Content Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-5 scrollbar-thin">

                {/* API Credentials Settings Popup Overlay */}
                {showSettingsPopup && (
                  <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in">
                    <div className={`${isLight ? 'bg-white border-gray-200' : 'bg-[#18181f] border-white/10'} border rounded-2xl w-full max-w-md p-6 shadow-2xl relative`}>
                      <button
                        type="button"
                        onClick={() => setShowSettingsPopup(false)}
                        className={`absolute top-4 right-4 transition-colors cursor-pointer ${isLight ? 'text-gray-400 hover:text-gray-900' : 'text-gray-400 hover:text-white'}`}
                      >
                        <X className="h-5 w-5" />
                      </button>
                      <h3 className={`text-sm font-bold mb-2 flex items-center gap-1.5 ${isLight ? 'text-gray-900' : 'text-white'}`}>
                        <Settings className="h-4 w-4 text-primary" /> Pexels API Key Configuration
                      </h3>
                      <p className={`text-[11px] mb-4 leading-relaxed ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>
                        By default, we search keylessly using SourceSplash. Enter your personal Pexels API Key to unlock unlimited searching of millions of original photos.
                      </p>
                      <div className="space-y-3">
                        <input
                          type="password"
                          placeholder="Paste your Pexels API Key here..."
                          value={userPexelsKey}
                          onChange={(e) => {
                            setUserPexelsKey(e.target.value);
                            localStorage.setItem('user_pexels_api_key', e.target.value);
                          }}
                          className={`w-full rounded-xl border px-3.5 py-2.5 text-xs focus:outline-none focus:border-primary ${isLight ? 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400' : 'bg-white/5 border-white/10 text-white placeholder-gray-500'}`}
                        />
                        <div className="flex gap-2 justify-end pt-2">
                          {userPexelsKey && (
                            <button
                              type="button"
                              onClick={() => {
                                setUserPexelsKey('');
                                localStorage.removeItem('user_pexels_api_key');
                                toast.success('Pexels API key cleared.');
                              }}
                              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-red-400 bg-red-500/10 hover:bg-red-500/20 transition-all border border-red-500/20 cursor-pointer"
                            >
                              Clear Key
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              setShowSettingsPopup(false);
                              toast.success('API Settings updated!');
                            }}
                            className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-primary hover:bg-primary-dark shadow-premium-glow transition-all cursor-pointer"
                          >
                            Save & Close
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Search Bar Row */}
                <div className="flex gap-2.5 items-center relative">
                  <div className="relative flex-1">
                    <span className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${isLight ? 'text-gray-400' : 'text-gray-400'}`}>
                      <Search className="h-4 w-4" />
                    </span>
                    <input
                      type="text"
                      placeholder="Search millions of free images..."
                      value={pixelSearchInput}
                      onFocus={() => setShowSuggestions(true)}
                      onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                      onChange={(e) => setPixelSearchInput(e.target.value)}
                      className={`w-full rounded-xl border pl-10 pr-9 py-2.5 text-xs focus:outline-none focus:border-primary ${isLight ? 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400' : 'bg-white/5 border-white/10 text-white placeholder-gray-500'}`}
                    />
                    {pixelSearchInput && (
                      <button
                        onClick={() => setPixelSearchInput('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white text-xs cursor-pointer"
                      >
                        ✕
                      </button>
                    )}
                    
                    {/* Suggestions Dropdown */}
                    {showSuggestions && (
                      <div className={`absolute top-full left-0 right-0 mt-1 border rounded-xl overflow-hidden shadow-2xl z-40 max-h-52 overflow-y-auto scrollbar-thin ${isLight ? 'bg-white border-gray-200' : 'bg-[#18181f] border-white/10'}`}>
                        {['Coffee', 'Latte Art', 'Espresso', 'Laptop', 'Coding', 'AI', 'Sunset', 'Nature', 'Forest', 'Ocean', 'Flowers', 'Roses', 'Birds', 'Food', 'Pizza', 'Burger', 'Gaming', 'Space', 'Galaxy', 'Abstract', 'Minimal'].filter(tag => 
                          !pixelSearchInput || tag.toLowerCase().startsWith(pixelSearchInput.toLowerCase())
                        ).map(suggestion => (
                          <button
                            key={suggestion}
                            type="button"
                            onMouseDown={() => {
                              setPixelSearchInput(suggestion);
                              setPixelCategory('all');
                            }}
                            className={`w-full text-left px-3.5 py-2 text-xs transition-colors border-b last:border-0 cursor-pointer ${isLight ? 'text-gray-700 hover:text-gray-900 hover:bg-gray-50 border-gray-100' : 'text-gray-300 hover:text-white hover:bg-white/5 border-white/5'}`}
                          >
                            🔍 {suggestion}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Favorites Trigger & Settings Icon */}
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setPixelShowFavoritesOnly(prev => !prev)}
                      className={`px-3.5 py-2.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                        pixelShowFavoritesOnly
                          ? 'bg-red-500/10 border-red-500/30 text-red-400'
                          : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
                      }`}
                    >
                      <Heart className={`h-3.5 w-3.5 ${pixelShowFavoritesOnly ? 'fill-current' : ''}`} />
                      <span className="hidden sm:inline">{pixelShowFavoritesOnly ? 'Show All' : `Favorites (${pixelFavorites.length})`}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowSettingsPopup(true)}
                      className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white transition-all cursor-pointer"
                      title="API key configuration"
                    >
                      <Settings className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Recent Searches (last 20) */}
                {recentSearches.length > 0 && !pixelShowFavoritesOnly && (
                  <div className="flex flex-wrap gap-1.5 items-center">
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${isLight ? 'text-gray-500' : 'text-gray-500'}`}>Recents:</span>
                    <div className="flex flex-wrap gap-1.5 max-h-12 overflow-y-auto scrollbar-thin">
                      {recentSearches.map(queryItem => (
                        <button
                          key={queryItem}
                          type="button"
                          onClick={() => {
                            setPixelCategory('all');
                            setPixelSearchInput(queryItem);
                          }}
                          className={`px-2 py-0.5 rounded-md border text-[10px] transition-all cursor-pointer ${isLight ? 'bg-gray-100 border-gray-200 text-gray-600 hover:text-gray-900 hover:border-primary/30' : 'bg-white/5 border-white/5 text-gray-400 hover:text-white hover:border-primary/30'}`}
                        >
                          {queryItem}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Scrollable Category Chips */}
                {!pixelShowFavoritesOnly && (
                  <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
                    {[
                      { id: 'all',          label: '🌍 All Curated' },
                      { id: 'trending',     label: '🔥 Trending' },
                      { id: 'technology',   label: '💻 Technology' },
                      { id: 'robots',       label: '🤖 Robots' },
                      { id: 'nature',       label: '🌲 Nature' },
                      { id: 'animals',      label: '🐯 Animals' },
                      { id: 'flowers',      label: '🌸 Flowers' },
                      { id: 'birds',        label: '🐦 Birds' },
                      { id: 'fruits',       label: '🍎 Fruits' },
                      { id: 'food',         label: '🍕 Food' },
                      { id: 'travel',       label: '✈️ Travel' },
                      { id: 'gaming',       label: '🎮 Gaming' },
                      { id: 'cars',         label: '🚗 Cars' },
                      { id: 'space',        label: '🚀 Space' },
                      { id: 'education',    label: '🎓 Education' },
                      { id: 'business',     label: '💼 Business' },
                      { id: 'abstract',     label: '🎨 Abstract' },
                      { id: 'minimal',      label: '⚪ Minimal' },
                      { id: 'fantasy',      label: '🪄 Fantasy' },
                      { id: 'architecture', label: '🏛️ Architecture' },
                      { id: 'backgrounds',  label: '🖼️ Backgrounds' },
                      { id: 'textures',     label: '✨ Textures' },
                      { id: 'patterns',     label: '💠 Patterns' },
                      { id: 'ocean',        label: '🌊 Ocean' },
                      { id: 'forest',       label: '🌳 Forest' },
                      { id: 'mountain',     label: '⛰️ Mountain' },
                      { id: 'cities',       label: '🌆 Cities' },
                      { id: 'art',          label: '🖌️ Art' }
                    ].map(cat => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => {
                          setPixelCategory(cat.id);
                          setPixelSearchInput('');
                          setPixelQuery('');
                          setPixelPage(1);
                          if (cat.id !== 'all') {
                            setPixelImages([]);
                          }
                        }}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all border cursor-pointer ${
                          pixelCategory === cat.id
                            ? 'bg-primary border-primary text-white shadow-premium-glow'
                            : isLight ? 'bg-gray-100 border-gray-200 text-gray-600 hover:text-gray-900' : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                )}

                {/* Sub-category quick chips */}
                {!pixelShowFavoritesOnly && pixelCategory !== 'all' && SUB_CATEGORIES[pixelCategory] && (
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                      Quick search in {pixelCategory}:
                    </p>
                    <div className="flex gap-1.5 flex-wrap">
                      {SUB_CATEGORIES[pixelCategory].map(sub => (
                        <button
                          key={sub}
                          type="button"
                          onClick={() => {
                            setPixelSearchInput(sub);
                            setPixelQuery(sub);
                            setPixelPage(1);
                            setPixelImages([]);
                          }}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-semibold shrink-0 transition-all border cursor-pointer ${
                            pixelQuery === sub
                              ? 'bg-primary/20 border-primary text-primary'
                              : isLight ? 'bg-gray-100 border-gray-200 text-gray-600 hover:text-gray-900 hover:border-gray-400' : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:border-white/30'
                          }`}
                        >
                          {sub}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Hint when no category selected and no search */}
                {!pixelShowFavoritesOnly && pixelCategory === 'all' && !pixelQuery && (
                  <p className="text-[10px] text-gray-600 text-center">
                    💡 Tip: Type <span className="text-gray-400 font-semibold">any keyword</span> to search — e.g. &quot;Paris&quot;, &quot;Mango&quot;, &quot;Panda&quot;, &quot;Lion&quot;, &quot;Galaxy&quot;...
                  </p>
                )}

                {pixelLoading && pixelImages.length === 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 py-6">
                    {Array.from({ length: 6 }).map((_, idx) => (
                      <div key={idx} className="aspect-video rounded-xl bg-white/5 animate-pulse border border-white/10"></div>
                    ))}
                  </div>
                )}

                {/* No Search results recovery state */}
                {pixelImages.length === 0 && !pixelLoading && (pixelQuery || pixelCategory !== 'all') && (
                  <div className="py-10 text-center border border-white/5 rounded-2xl bg-white/[0.01] p-6 space-y-4">
                    <p className="text-xs text-gray-400">
                      No results found for <span className="font-semibold text-white">"{pixelQuery || pixelCategory}"</span>.
                    </p>
                    <div className="space-y-2">
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Suggested Searches:</p>
                      <div className="flex justify-center gap-1.5 flex-wrap">
                        {['Sunset', 'Flowers', 'Cyberpunk', 'Space', 'Pizza', 'Gaming'].map(tag => (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => {
                              setPixelCategory('all');
                              setPixelSearchInput(tag);
                            }}
                            className="px-2.5 py-1 rounded-full border border-white/10 text-[10px] text-gray-300 hover:border-primary transition-all bg-white/5 cursor-pointer"
                          >
                            {tag}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="pt-2 border-t border-white/5 text-left">
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Editor's Curated Fallback</p>
                      <div className="grid grid-cols-3 gap-2">
                        {homeLanesData.trending.slice(0, 3).map(img => (
                          <div
                            key={`fallback-${img.id}`}
                            onClick={() => {
                              updateField('url', img.src.large2x);
                              toast.success('Applied image as background! 🌟');
                            }}
                            className="relative aspect-video rounded-lg overflow-hidden cursor-pointer group"
                          >
                            <img src={img.src.medium} alt="Curated" className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* HOME SCREEN LANE LAYOUTS (when no query has been typed) */}
                {!pixelQuery && pixelCategory === 'all' && !pixelShowFavoritesOnly && (
                  <div className="space-y-6">
                    
                    {/* Category Banner */}
                    <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-primary/30 via-cyan-500/10 to-transparent p-5 border border-white/10 text-left">
                      <h2 className="text-sm font-bold text-white mb-1">Unleash Your Creativity</h2>
                      <p className="text-[11px] text-gray-400 max-w-sm mb-3">Explore millions of premium stock photos, illustrations, and backgrounds instantly.</p>
                      <button
                        type="button"
                        onClick={() => setPixelSearchInput('Cyberpunk')}
                        className="px-3.5 py-1.5 rounded-xl bg-white text-black text-[11px] font-bold hover:bg-gray-200 transition-all shadow-md cursor-pointer"
                      >
                        🚀 Discover Cyberpunk
                      </button>
                    </div>

                    {/* Lane: Favorite Images */}
                    {pixelFavorites.length > 0 && (
                      <div className="space-y-2 text-left">
                        <h3 className="text-xs font-bold text-white flex items-center gap-1.5">❤️ Favorite Images</h3>
                        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
                          {pixelFavorites.map(img => (
                            <div
                              key={`fav-lane-${img.id}`}
                              onClick={() => setSelectedImageForPreview(img)}
                              className="relative w-40 aspect-video rounded-xl overflow-hidden border border-white/10 cursor-pointer shrink-0 group"
                            >
                              <img src={img.src.medium} alt="Favorite" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <span className="text-[9px] text-white font-bold bg-primary px-2 py-0.5 rounded-full">Preview</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Lane: Recently Applied */}
                    {pixelRecents.length > 0 && (
                      <div className="space-y-2 text-left">
                        <h3 className="text-xs font-bold text-white flex items-center gap-1.5">🕒 Recently Used</h3>
                        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
                          {pixelRecents.map(img => (
                            <div
                              key={`recent-lane-${img.id}`}
                              onClick={() => setSelectedImageForPreview(img)}
                              className="relative w-40 aspect-video rounded-xl overflow-hidden border border-white/10 cursor-pointer shrink-0 group"
                            >
                              <img src={img.src.medium} alt="Recent" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <span className="text-[9px] text-white font-bold bg-primary px-2 py-0.5 rounded-full">Preview</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Lane: Trending Images */}
                    {homeLanesData.trending.length > 0 && (
                      <div className="space-y-2 text-left">
                        <h3 className="text-xs font-bold text-white flex items-center gap-1.5">🔮 Trending Images</h3>
                        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
                          {homeLanesData.trending.map(img => (
                            <div
                              key={`trending-lane-${img.id}`}
                              onClick={() => setSelectedImageForPreview(img)}
                              className="relative w-40 aspect-video rounded-xl overflow-hidden border border-white/10 cursor-pointer shrink-0 group"
                            >
                              <img src={img.src.medium} alt="Trending" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <span className="text-[9px] text-white font-bold bg-primary px-2 py-0.5 rounded-full">Preview</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Lane: Editor's Choice */}
                    {homeLanesData.editorsChoice.length > 0 && (
                      <div className="space-y-2 text-left">
                        <h3 className="text-xs font-bold text-white flex items-center gap-1.5">🏆 Editor's Choice</h3>
                        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
                          {homeLanesData.editorsChoice.map(img => (
                            <div
                              key={`editors-lane-${img.id}`}
                              onClick={() => setSelectedImageForPreview(img)}
                              className="relative w-40 aspect-video rounded-xl overflow-hidden border border-white/10 cursor-pointer shrink-0 group"
                            >
                              <img src={img.src.medium} alt="Editor" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <span className="text-[9px] text-white font-bold bg-primary px-2 py-0.5 rounded-full">Preview</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Lane: Popular Images */}
                    {homeLanesData.popular.length > 0 && (
                      <div className="space-y-2 text-left">
                        <h3 className="text-xs font-bold text-white flex items-center gap-1.5">⚡ Popular Images</h3>
                        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
                          {homeLanesData.popular.map(img => (
                            <div
                              key={`popular-lane-${img.id}`}
                              onClick={() => setSelectedImageForPreview(img)}
                              className="relative w-40 aspect-video rounded-xl overflow-hidden border border-white/10 cursor-pointer shrink-0 group"
                            >
                              <img src={img.src.medium} alt="Popular" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <span className="text-[9px] text-white font-bold bg-primary px-2 py-0.5 rounded-full">Preview</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  </div>
                )}

                {/* MASONRY IMAGE GRID (Search results & Favorites list) */}
                {(pixelImages.length > 0 || pixelShowFavoritesOnly) && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5 scrollbar-thin">
                      {(pixelShowFavoritesOnly ? pixelFavorites : pixelImages).map(img => {
                        const isApplied = config.url === img.src.large2x;
                        const isFav = pixelFavorites.some(f => f.id === img.id);
                        
                        const minWidth = img.width || 1920;
                        const qTag = minWidth >= 3840 ? '4K' : minWidth >= 2560 ? 'UHD' : 'HD';

                        return (
                          <div
                            key={img.id}
                            onClick={() => setSelectedImageForPreview(img)}
                            onDoubleClick={() => {
                              updateField('url', img.src.large2x);
                              addToRecents(img);
                              toast.success('Applied image as background! 🌟');
                            }}
                            className={`relative group aspect-video rounded-xl overflow-hidden border-2 cursor-pointer transition-all ${
                              isApplied ? 'border-primary scale-[1.02] shadow-premium-glow' : 'border-transparent hover:border-white/20'
                            }`}
                            title="Double-Click to Apply, Single-Click to Open Preview"
                          >
                            <img src={img.src.medium} alt="Stock" className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300" loading="lazy" />
                            
                            <button
                              type="button"
                              onClick={(e) => toggleFavorite(img, e)}
                              className="absolute top-2 right-2 h-6 w-6 rounded-full bg-black/60 hover:bg-black/80 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity z-20 cursor-pointer"
                            >
                              <Heart className={`h-3.5 w-3.5 ${isFav ? 'text-red-500 fill-current' : 'text-white'}`} />
                            </button>

                            <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded text-[8px] font-extrabold text-white bg-black/55 uppercase z-20">
                              {qTag}
                            </span>

                            <div className="absolute inset-0 bg-black/35 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2 pb-2.5 text-left">
                              <div className="flex justify-center flex-1 items-center">
                                <span className="text-[10px] text-white font-bold bg-primary/90 px-2.5 py-1 rounded-full shadow">Preview</span>
                              </div>
                              <div className="space-y-0.5 truncate">
                                <p className="text-[9px] text-white font-semibold truncate">📸 By {img.photographer}</p>
                                <p className="text-[8px] text-gray-300 truncate">{img.width} x {img.height}</p>
                              </div>
                            </div>
                          </div>
                        );
                      })}

                      {pixelLoading && Array.from({ length: 4 }).map((_, idx) => (
                        <div key={`sk-more-${idx}`} className="aspect-video rounded-xl bg-white/5 animate-pulse border border-white/10"></div>
                      ))}
                    </div>

                    {/* Load More Pagination */}
                    {!pixelShowFavoritesOnly && pixelHasMore && (
                      <div className="flex justify-center pb-2">
                        <button
                          type="button"
                          onClick={() => setPixelPage(p => p + 1)}
                          disabled={pixelLoading}
                          className="px-4 py-1.5 rounded-xl border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 text-xs font-bold text-gray-300 transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          {pixelLoading ? 'Loading...' : 'Load More Images'}
                        </button>
                      </div>
                    )}
                  </div>
                )}
                
                <p className="text-[9px] text-gray-500 italic text-center">Double-click an image to apply it. Single-click to preview. Images provided by Pexels / SourceSplash.</p>

                {/* LARGE PREVIEW MODAL INSIDE PORTAL */}
                {selectedImageForPreview && (
                  <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/85 backdrop-blur-md p-0 sm:p-6 animate-fade-in">
                    <div className={`${isLight ? 'bg-white border-gray-200' : 'bg-[#121216] border-white/10'} border-0 sm:border rounded-none sm:rounded-2xl w-full max-w-3xl h-full sm:h-auto overflow-hidden shadow-2xl flex flex-col md:flex-row relative text-left`}>
                      
                      {/* Close Button */}
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedImageForPreview(null);
                          setZoomScale(1);
                        }}
                        className={`absolute top-4 right-4 rounded-full p-1.5 transition-all z-30 cursor-pointer ${isLight ? 'text-gray-500 hover:text-gray-900 bg-black/10 hover:bg-black/20' : 'text-gray-400 hover:text-white bg-black/40 hover:bg-black/60'}`}
                      >
                        <X className="h-5 w-5" />
                      </button>

                      {/* Left Side: Zoomable Image Container */}
                      <div className="flex-1 bg-black/20 relative flex items-center justify-center overflow-hidden aspect-video md:aspect-auto md:h-[450px]">
                        <div
                          className="w-full h-full flex items-center justify-center transition-transform duration-200"
                          style={{ transform: `scale(${zoomScale})` }}
                        >
                          <img
                            src={selectedImageForPreview.src.large2x}
                            alt="Zoomable Preview"
                            className="max-w-full max-h-full object-contain"
                          />
                        </div>

                        {/* Zoom controls floating */}
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-black/70 px-3 py-1.5 rounded-full border border-white/10 z-20">
                          <button
                            type="button"
                            onClick={() => setZoomScale(s => Math.max(0.5, s - 0.2))}
                            className="text-gray-400 hover:text-white transition-colors cursor-pointer"
                          >
                            <ZoomOut className="h-4 w-4" />
                          </button>
                          <span className="text-[10px] font-bold text-white w-9 text-center">{Math.round(zoomScale * 100)}%</span>
                          <button
                            type="button"
                            onClick={() => setZoomScale(s => Math.min(3, s + 0.2))}
                            className="text-gray-400 hover:text-white transition-colors cursor-pointer"
                          >
                            <ZoomIn className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      {/* Right Side: Information Panel */}
                      <div className={`w-full md:w-72 p-5 flex flex-col justify-between border-t md:border-t-0 md:border-l ${isLight ? 'border-gray-200 bg-gray-50' : 'border-white/10 bg-white/[0.01]'} text-left`}>
                        <div className="space-y-4">
                          
                          {/* Header */}
                          <div>
                            <h4 className="text-[10px] font-bold text-primary uppercase tracking-wider">Image Metadata</h4>
                            <p className={`text-xs font-semibold truncate mt-1 ${isLight ? 'text-gray-900' : 'text-white'}`}>📸 By {selectedImageForPreview.photographer}</p>
                            <a
                              href={selectedImageForPreview.photographer_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[10px] text-gray-500 underline hover:text-primary transition-colors flex items-center gap-1 mt-0.5"
                            >
                              Visit Photographer Profile <ExternalLink className="h-2.5 w-2.5" />
                            </a>
                          </div>

                          {/* Stats */}
                          <div className={`grid grid-cols-2 gap-3 pt-2.5 border-t ${isLight ? 'border-gray-200' : 'border-white/5'}`}>
                            <div>
                              <span className="text-[9px] text-gray-500 font-bold block uppercase">Resolution</span>
                              <span className={`text-xs font-semibold ${isLight ? 'text-gray-700' : 'text-gray-300'}`}>{selectedImageForPreview.width} x {selectedImageForPreview.height}</span>
                            </div>
                            <div>
                              <span className="text-[9px] text-gray-500 font-bold block uppercase">Quality</span>
                              <span className="text-xs text-primary font-bold">
                                {selectedImageForPreview.width >= 3840 ? '4K UHD' : selectedImageForPreview.width >= 2560 ? 'QHD' : 'HD'}
                              </span>
                            </div>
                          </div>

                        </div>

                        {/* Actions Panel */}
                        <div className="space-y-2 pt-4 md:pt-0">

                          {/* ✅ Inline Applied Confirmation Banner */}
                          {bgAppliedConfirm && (
                            <div className="flex items-center gap-2.5 bg-emerald-500 text-white rounded-xl px-4 py-3 shadow-lg animate-fade-in">
                              <span className="text-lg">🌟</span>
                              <div>
                                <p className="text-xs font-bold">Background Applied!</p>
                                <p className="text-[10px] opacity-80">Visible in your quiz preview</p>
                              </div>
                              <Check className="h-5 w-5 ml-auto shrink-0" />
                            </div>
                          )}

                          <button
                            type="button"
                            onClick={() => {
                              updateField('url', selectedImageForPreview.src.large2x);
                              addToRecents(selectedImageForPreview);
                              setBgAppliedConfirm(true);
                              setTimeout(() => setBgAppliedConfirm(false), 3000);
                            }}
                            className={`w-full py-2 rounded-xl text-xs font-bold text-white transition-all flex items-center justify-center gap-1.5 shadow-premium-glow cursor-pointer ${
                              bgAppliedConfirm
                                ? 'bg-emerald-500 hover:bg-emerald-600'
                                : 'bg-primary hover:bg-primary-dark'
                            }`}
                          >
                            <Check className="h-3.5 w-3.5" />
                            {bgAppliedConfirm ? 'Applied ✓' : 'Apply Background'}
                          </button>

                          <button
                              type="button"
                              onClick={() => toggleFavorite(selectedImageForPreview)}
                              className={`w-full py-1.5 rounded-xl border text-[11px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                                pixelFavorites.some(f => f.id === selectedImageForPreview.id)
                                  ? 'bg-red-500/10 border-red-500/25 text-red-400'
                                  : isLight ? 'bg-gray-100 border-gray-200 text-gray-600 hover:text-gray-900' : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
                              }`}
                            >
                              <Heart className="h-3.5 w-3.5 fill-current" /> Favorite
                            </button>
                        </div>

                      </div>
                    </div>
                  </div>
                )}

              </div>

            </div>
          </div>,
          document.body
        )}

        {/* Background Adjustment Controls */}
        <div className="grid gap-5 sm:grid-cols-2 bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-5">
          
          {/* Sliders */}
          <div className="space-y-4">
            <div className="space-y-1.5 text-left">
              <div className="flex justify-between text-xs font-bold text-gray-400">
                <span>Blur Intensity</span>
                <span className="text-primary">{config.blur}px</span>
              </div>
              <input
                type="range"
                min="0"
                max="20"
                value={config.blur}
                onChange={(e) => updateField('blur', Number(e.target.value))}
                className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>

            <div className="space-y-1.5 text-left">
              <div className="flex justify-between text-xs font-bold text-gray-400">
                <span>Brightness</span>
                <span className="text-primary">{config.brightness}%</span>
              </div>
              <input
                type="range"
                min="50"
                max="150"
                value={config.brightness}
                onChange={(e) => updateField('brightness', Number(e.target.value))}
                className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>

            <div className="space-y-1.5 text-left">
              <div className="flex justify-between text-xs font-bold text-gray-400">
                <span>Overlay Opacity</span>
                <span className="text-primary">{config.overlayOpacity}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={config.overlayOpacity}
                onChange={(e) => updateField('overlayOpacity', Number(e.target.value))}
                className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>
          </div>

          {/* Dropdowns and Toggles */}
          <div className="space-y-4 text-left">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Fit</label>
                <select
                  value={config.fit}
                  onChange={(e) => updateField('fit', e.target.value)}
                  className="w-full rounded-lg bg-[#111115] border border-white/10 px-2.5 py-1.5 text-xs text-white focus:outline-none"
                >
                  <option value="cover">Cover (Default)</option>
                  <option value="contain">Contain</option>
                  <option value="fill">Fill</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Position</label>
                <select
                  value={config.position}
                  onChange={(e) => updateField('position', e.target.value)}
                  className="w-full rounded-lg bg-[#111115] border border-white/10 px-2.5 py-1.5 text-xs text-white focus:outline-none"
                >
                  <option value="center">Center</option>
                  <option value="top">Top</option>
                  <option value="bottom">Bottom</option>
                  <option value="left">Left</option>
                  <option value="right">Right</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="flex items-center justify-between bg-[#111115] border border-white/10 px-3 py-2 rounded-xl">
                <span className="text-[11px] font-bold text-gray-400">Dark Overlay</span>
                <input
                  type="checkbox"
                  checked={config.darkOverlay}
                  onChange={(e) => updateField('darkOverlay', e.target.checked)}
                  className="w-4.5 h-4.5 rounded text-primary focus:ring-primary focus:ring-opacity-20 cursor-pointer accent-primary"
                />
              </div>

              <div className="space-y-1">
                <select
                  value={config.gradientOverlay}
                  onChange={(e) => updateField('gradientOverlay', e.target.value)}
                  className="w-full rounded-lg bg-[#111115] border border-white/10 px-2.5 py-1.5 text-xs text-white focus:outline-none"
                >
                  <option value="none">No Gradient Overlay</option>
                  <option value="linear">Linear Gradient</option>
                  <option value="radial">Radial Gradient</option>
                </select>
              </div>
            </div>

            {config.gradientOverlay !== 'none' && (
              <div className="flex items-center gap-3 animate-fade-in">
                <div className="flex-1 flex items-center gap-1.5">
                  <span className="text-[10px] text-gray-500 font-bold uppercase">Color 1</span>
                  <input
                    type="color"
                    value={config.gradientColor1}
                    onChange={(e) => updateField('gradientColor1', e.target.value)}
                    className="h-6 w-10 border border-white/10 rounded cursor-pointer bg-transparent"
                  />
                </div>
                <div className="flex-1 flex items-center gap-1.5">
                  <span className="text-[10px] text-gray-500 font-bold uppercase">Color 2</span>
                  <input
                    type="color"
                    value={config.gradientColor2}
                    onChange={(e) => updateField('gradientColor2', e.target.value)}
                    className="h-6 w-10 border border-white/10 rounded cursor-pointer bg-transparent"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Right Column: Live Preview Area */}
      {showPreview && (
        <div className="lg:col-span-5 flex flex-col justify-between">
          {/* Device Selector */}
          <div className="flex justify-between items-center bg-white/5 border border-white/10 p-2 rounded-xl mb-4">
            <span className="text-xs font-bold text-gray-400 pl-2">Live Quiz Preview</span>
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() => setPreviewDevice('desktop')}
                className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase transition-all ${
                  previewDevice === 'desktop'
                    ? 'bg-primary text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <span className="flex items-center gap-1"><Monitor className="h-3 w-3" />Desktop</span>
              </button>
              <button
                type="button"
                onClick={() => setPreviewDevice('mobile')}
                className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase transition-all ${
                  previewDevice === 'mobile'
                    ? 'bg-primary text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <span className="flex items-center gap-1"><Smartphone className="h-3 w-3" />Mobile</span>
              </button>
            </div>
          </div>

          {/* Preview Screen Frame */}
          <div className="flex-1 flex items-center justify-center bg-black/30 border border-white/10 rounded-2xl p-4 overflow-hidden min-h-[300px] relative">
            <div
              className={`transition-all duration-500 overflow-hidden relative shadow-2xl rounded-xl border border-white/10 ${
                previewDevice === 'mobile' ? 'w-[200px] h-[340px]' : 'w-full h-[340px]'
              }`}
            >
              {/* Background representation */}
              <div
                className="absolute inset-0 bg-gray-900 transition-all duration-300"
                style={
                  config.url
                    ? {
                        backgroundImage: `url(${config.url})`,
                        backgroundPosition: config.position,
                        backgroundSize: config.fit,
                        filter: `blur(${config.blur}px) brightness(${config.brightness}%)`,
                      }
                    : {
                        background: 'linear-gradient(135deg, #1e1b4b, #111827)'
                      }
                }
              />

              {/* Dark Overlay Layer */}
              {config.url && config.darkOverlay && (
                <div
                  className="absolute inset-0 z-1 pointer-events-none transition-all duration-300"
                  style={{
                    backgroundColor: `rgba(0,0,0,${config.overlayOpacity / 100})`,
                  }}
                />
              )}

              {/* Gradient Overlay Layer */}
              {config.url && config.gradientOverlay !== 'none' && (
                <div
                  className="absolute inset-0 z-2 pointer-events-none transition-all duration-300"
                  style={{
                    background:
                      config.gradientOverlay === 'linear'
                        ? `linear-gradient(135deg, ${config.gradientColor1}44, ${config.gradientColor2}44)`
                        : `radial-gradient(circle, ${config.gradientColor1}44 0%, ${config.gradientColor2}44 100%)`,
                  }}
                />
              )}

              {/* Mock Quiz UI Container */}
              <div className={`absolute inset-0 flex flex-col justify-center p-3 relative z-10 select-none ${previewDevice === 'mobile' ? 'gap-1' : 'gap-0'}`}>
                
                {/* Top Section */}
                <div className="flex flex-col">
                  {/* Header Indicator */}
                  <div className="flex justify-start items-center pb-1 relative z-10 shrink-0">
                    <span className="bg-primary/25 border border-primary/30 px-1.5 py-0.5 rounded uppercase tracking-wider text-[8px] text-primary truncate max-w-[120px] font-bold">
                      {displayCategory}
                    </span>
                  </div>

                  {/* Timer Display */}
                  <div className="flex justify-center relative z-10 shrink-0 my-1">
                    <div className="flex items-center gap-1 bg-black/50 backdrop-blur-sm px-2 py-0.5 rounded-full border border-white/10">
                      <span className="text-[7px]">⏱️</span>
                      <span className="text-[9px] font-mono tracking-widest text-white font-bold">
                        00:{displayTime}
                      </span>
                    </div>
                  </div>

                  {/* Mock Card */}
                  <div className="bg-white rounded-lg p-2.5 border border-gray-200 shadow-sm text-center mx-1 my-1 shrink-0 relative z-10">
                    <p className="text-[10px] leading-snug tracking-tight text-gray-900 font-black line-clamp-3">
                      {displayQuestion}
                    </p>
                  </div>
                </div>

                {/* Options grid */}
                <div className={`grid gap-1.5 relative z-10 w-full pb-1 ${previewDevice === 'mobile' ? 'grid-cols-1' : 'grid-cols-2'}`}>
                  {displayOptions.map((optText, optIdx) => {
                    const isCorrect = Number(displayCorrectAnswer) === optIdx;
                    const optionBgClasses = [
                      'bg-[#e21b3c] border-[#e21b3c]',
                      'bg-[#1368ce] border-[#1368ce]',
                      'bg-[#d89e00] border-[#d89e00]',
                      'bg-[#26890c] border-[#26890c]'
                    ];
                    
                    return (
                      <div 
                        key={optIdx} 
                        className={`rounded-md p-1.5 text-[7px] flex items-center justify-between gap-1 border text-white shadow-sm ${optionBgClasses[optIdx]} ${
                          isCorrect ? 'ring-2 ring-white/50 scale-[1.01]' : 'opacity-90'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 min-w-0">
                          {optionShapes[optIdx]}
                          <span className="font-extrabold truncate">{optText || `Option ${optIdx + 1}`}</span>
                        </div>
                        <div className="h-3 w-3 rounded-full border border-white/70 flex items-center justify-center shrink-0">
                          {isCorrect && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
