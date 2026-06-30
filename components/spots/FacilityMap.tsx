"use client";

import { useRef, useEffect, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { SpotExplorerSpot } from "./SpotExplorer";

// Escape user/dataset-derived strings before interpolating into popup HTML.
const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

// Format duration helper (minutes -> readable hours/mins)
const formatDuration = (minutes: number | undefined): string => {
  if (!minutes) return "0 min";
  if (minutes < 60) return `${Math.floor(minutes)} min`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = Math.floor(minutes % 60);
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
};

type FacilityMapProps = {
  spots: SpotExplorerSpot[];
  highlightedId: number | null;
  onSpotClick: (id: number) => void;
};

export default function FacilityMap({
  spots,
  highlightedId,
  onSpotClick,
}: FacilityMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<Map<number, mapboxgl.Marker>>(new Map());
  const activePopupRef = useRef<mapboxgl.Popup | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  // Clean up references and map on unmount
  useEffect(() => {
    if (!mapContainer.current) return;

    // Use configured mapbox style/token, or defaults for local OpenFreeMap style.json
    const styleUrl = process.env.NEXT_PUBLIC_MAPBOX_STYLE_URL || "/map/style.json";
    const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || "pk.eyJ1IjoiIiwiYSI6IiJ9";

    mapboxgl.accessToken = token;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: styleUrl,
      center: [-88.2272, 40.109],
      zoom: 15.5,
      pitch: 45,
      bearing: 0,
      antialias: true,
      // Lock orientation: pan and zoom only, no rotating or tilting the map.
      dragRotate: false,
      pitchWithRotate: false,
      touchPitch: false,
    });

    // Also disable two-finger rotate gestures (keeps pinch-to-zoom intact).
    map.current.touchZoomRotate.disableRotation();

    map.current.on("load", () => {
      setIsMapLoaded(true);

      const m = map.current!;
      // Optional: attempt to configure Point of Interest visibility if using Mapbox basemap
      try {
        m.setConfigProperty("basemap", "showPointOfInterestLabels", false);
      } catch {
        // Non-standard style
      }

      // Hide the built-in building labels from the base style so the custom
      // spot label layer is the only building label source on this map.
      try {
        if (m.getLayer("building_labels")) {
          m.setLayoutProperty("building_labels", "visibility", "none");
        }
      } catch {
        // Non-standard style or layer layout
      }
    });

    map.current.addControl(new mapboxgl.NavigationControl({ showCompass: false }));
    map.current.addControl(
      new mapboxgl.GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: true,
      })
    );

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Sync zoom/fly to highlighted spot from parent (SpotExplorer search list click)
  useEffect(() => {
    if (!map.current || !isMapLoaded || highlightedId === null) return;

    const spot = spots.find((s) => s.id === highlightedId);
    if (spot && typeof spot.lat === "number" && typeof spot.lng === "number") {
      map.current.flyTo({
        center: [spot.lng, spot.lat],
        zoom: 17,
        duration: 1000,
        essential: true,
      });
    }
  }, [highlightedId, spots, isMapLoaded]);

  // Update map markers when spots list updates
  useEffect(() => {
    if (!map.current || !isMapLoaded) return;

    // Remove old popups
    if (activePopupRef.current) {
      activePopupRef.current.remove();
      activePopupRef.current = null;
    }

    // Helper: Create customized marker HTML
    const createMarkerElement = (spot: SpotExplorerSpot) => {
      const markerEl = document.createElement("div");
      markerEl.className = "relative flex items-center justify-center cursor-pointer transition hover:scale-110";

      // Outer rings/glows
      const ringEl = document.createElement("span");
      const dotEl = document.createElement("span");

      if (spot.activeSessions > 0) {
        // Hot spot: pulsing green marker
        ringEl.className = "animate-ping absolute inline-flex h-6 w-6 rounded-full bg-emerald-400 opacity-75";
        dotEl.className = "relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border border-white shadow-md";
      } else if (spot.sessionsLastWeek > 0) {
        // Active spot (past week): static amber marker
        ringEl.className = "absolute inline-flex h-4 w-4 rounded-full bg-amber-400 opacity-40";
        dotEl.className = "relative inline-flex rounded-full h-3 w-3 bg-amber-500 border border-white shadow";
      } else {
        // Inactive spot: small gray marker
        ringEl.className = "";
        dotEl.className = "relative inline-flex rounded-full h-2.5 w-2.5 bg-slate-400 border border-white opacity-80";
      }

      markerEl.appendChild(ringEl);
      markerEl.appendChild(dotEl);

      return markerEl;
    };

    // Helper: Tooltip content
    const createPopupContent = (spot: SpotExplorerSpot) => {
      const isHot = spot.activeSessions > 0;
      return `
        <div class="p-2 font-sans min-w-[160px] text-slate-900 leading-tight">
          <div class="font-bold text-sm text-slate-800">${escapeHtml(spot.name)}</div>
          <div class="text-xs text-slate-500 mt-0.5">${escapeHtml(spot.area || "UIUC Campus")}</div>
          <div class="border-t border-slate-100 my-1.5"></div>
          
          <div class="flex items-center gap-1.5 text-xs font-semibold ${isHot ? "text-emerald-600 animate-pulse" : "text-slate-500"}">
            <span class="relative flex h-2 w-2">
              ${isHot 
                ? `<span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                   <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>`
                : `<span class="relative inline-flex rounded-full h-2 w-2 bg-slate-300"></span>`
              }
            </span>
            <span>${spot.activeSessions} studying now</span>
          </div>
          
          <div class="text-xs text-slate-600 mt-1">
            📅 <strong>${spot.sessionsLastWeek}</strong> sessions this week
          </div>
          <div class="text-xs text-slate-600">
            ⏱️ <strong>${formatDuration(spot.totalMinutes)}</strong> total time
          </div>
        </div>
      `;
    };

    // Helper: Bind marker events
    const setupMarkerInteractions = (
      markerEl: HTMLDivElement,
      spot: SpotExplorerSpot
    ) => {
      if (typeof spot.lng !== "number" || typeof spot.lat !== "number") return;

      markerEl.addEventListener("mouseenter", () => {
        activePopupRef.current?.remove();

        activePopupRef.current = new mapboxgl.Popup({
          closeButton: false,
          closeOnClick: false,
          offset: [0, -10],
          className: "custom-mapbox-popup",
        })
          .setLngLat([spot.lng!, spot.lat!])
          .setHTML(createPopupContent(spot))
          .addTo(map.current!);
      });

      markerEl.addEventListener("mouseleave", () => {
        activePopupRef.current?.remove();
        activePopupRef.current = null;
      });

      markerEl.addEventListener("click", (e) => {
        activePopupRef.current?.remove();
        activePopupRef.current = null;

        map.current?.flyTo({
          center: [spot.lng!, spot.lat!],
          zoom: 17,
          duration: 1000,
          essential: true,
        });

        onSpotClick(spot.id);
        e.stopPropagation();
      });
    };

    const currentKeys = new Set(markersRef.current.keys());

    spots.forEach((spot) => {
      if (typeof spot.lat !== "number" || typeof spot.lng !== "number") return;

      // Delete key from set to keep track of unused markers
      currentKeys.delete(spot.id);

      const existing = markersRef.current.get(spot.id);
      if (existing) {
        // If data might have changed, remove old and recreate
        existing.remove();
      }

      const el = createMarkerElement(spot);
      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([spot.lng, spot.lat])
        .addTo(map.current!);

      setupMarkerInteractions(el, spot);
      markersRef.current.set(spot.id, marker);
    });

    // Remove markers for deleted/filtered spots
    currentKeys.forEach((key) => {
      markersRef.current.get(key)?.remove();
      markersRef.current.delete(key);
    });

    // Setup GeoJSON symbol label layer for building names
    try {
      const mapRef = map.current!;
      const sourceId = "spot-points";
      const layerId = "spot-labels";

      const features = spots
        .filter((s) => typeof s.lat === "number" && typeof s.lng === "number")
        .map((s) => ({
          type: "Feature" as const,
          geometry: {
            type: "Point" as const,
            coordinates: [s.lng!, s.lat!],
          },
          properties: {
            id: s.id,
            name: s.name,
          },
        }));

      const geojson: any = {
        type: "FeatureCollection",
        features,
      };

      const existingSource = mapRef.getSource(sourceId) as
        | mapboxgl.GeoJSONSource
        | undefined;

      if (existingSource) {
        existingSource.setData(geojson as any);
      } else {
        mapRef.addSource(sourceId, { type: "geojson", data: geojson });

        // Find the first symbol layer in the style to insert our labels layer underneath
        const firstTextLayer = mapRef
          .getStyle()
          .layers?.find(
            (l: any) => l.type === "symbol" && l.layout && l.layout["text-field"]
          );

        mapRef.addLayer(
          {
            id: layerId,
            type: "symbol",
            source: sourceId,
            layout: {
              "text-field": ["get", "name"],
              "text-font": ["Noto Sans Bold"],
              "text-size": [
                "interpolate",
                ["linear"],
                ["zoom"],
                14, 11,
                16, 13,
                18, 15,
              ],
              "text-allow-overlap": false,
              "text-variable-anchor": ["top", "bottom", "left", "right"],
              "text-radial-offset": 0.8,
              "text-max-width": 10,
              "text-justify": "auto",
            },
            paint: {
              "text-color": "#ffffff",
              "text-halo-color": "#000000",
              "text-halo-width": 2,
              "text-halo-blur": 0,
              "text-opacity": ["interpolate", ["linear"], ["zoom"], 14, 0, 14.5, 1],
              // Keep labels drawn over 3D buildings (v3 occludes symbols by default).
              "text-occlusion-opacity": 1,
            },
          },
          firstTextLayer?.id
        );

        // Interactive hover and click for building labels
        mapRef.on("mouseenter", layerId, (e: any) => {
          mapRef.getCanvas().style.cursor = "pointer";
          const feature = e.features && e.features[0];
          if (!feature) return;

          const spotId = feature.properties?.id;
          const spot = spots.find((s) => s.id === spotId);
          if (spot && typeof spot.lng === "number" && typeof spot.lat === "number") {
            activePopupRef.current?.remove();
            activePopupRef.current = new mapboxgl.Popup({
              closeButton: false,
              closeOnClick: false,
              offset: [0, -10],
            })
              .setLngLat([spot.lng, spot.lat])
              .setHTML(createPopupContent(spot))
              .addTo(mapRef);
          }
        });

        mapRef.on("mouseleave", layerId, () => {
          mapRef.getCanvas().style.cursor = "";
          activePopupRef.current?.remove();
          activePopupRef.current = null;
        });

        mapRef.on("click", layerId, (e: any) => {
          const feature = e.features && e.features[0];
          if (!feature) return;

          const spotId = feature.properties?.id;
          const spot = spots.find((s) => s.id === spotId);
          if (spot && typeof spot.lng === "number" && typeof spot.lat === "number") {
            activePopupRef.current?.remove();
            activePopupRef.current = null;

            mapRef.flyTo({
              center: [spot.lng, spot.lat],
              zoom: 17,
              duration: 1000,
              essential: true,
            });

            onSpotClick(spot.id);
          }
        });
      }
    } catch (e) {
      console.warn("Building labels layer setup failed:", e);
    }
  }, [spots, isMapLoaded, onSpotClick]);

  return (
    <div className="relative w-full h-full min-h-[350px] md:min-h-[450px]">
      <div
        ref={mapContainer}
        className="w-full h-full absolute inset-0 [filter:saturate(1.2)]"
      />
    </div>
  );
}
