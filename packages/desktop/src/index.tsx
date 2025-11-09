import React from 'react';

export interface DesktopIcon {
  id: string;
  label: string;
  icon?: string;
  appId?: string;
  x: number;
  y: number;
}

export interface DesktopProps {
  wallpaper?: string;
  icons: DesktopIcon[];
  onIconClick: (icon: DesktopIcon) => void;
  onIconDoubleClick: (icon: DesktopIcon) => void;
}

export const Desktop: React.FC<DesktopProps> = ({
  wallpaper,
  icons,
  onIconClick,
  onIconDoubleClick,
}) => {
  return (
    <div
      className="desktop"
      style={{ backgroundImage: wallpaper ? `url(${wallpaper})` : undefined }}
    >
      <div className="desktop-icons">
        {icons.map((icon) => (
          <div
            key={icon.id}
            className="desktop-icon"
            style={{ left: icon.x, top: icon.y }}
            onClick={() => onIconClick(icon)}
            onDoubleClick={() => onIconDoubleClick(icon)}
          >
            {icon.icon && <span className="icon">{icon.icon}</span>}
            <span className="label">{icon.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export interface WallpaperProps {
  src: string;
}

export const Wallpaper: React.FC<WallpaperProps> = ({ src }) => {
  return (
    <div
      className="wallpaper"
      style={{ backgroundImage: `url(${src})` }}
    />
  );
};

