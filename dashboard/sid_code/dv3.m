function extract_districts_stronger
    % 1. Read image
    imgRGB = imread('himark_map.png');
    if isempty(imgRGB)
        error('Could not read himark_color_map.png');
    end
    
    % Convert to HSV
    imgHSV = rgb2hsv(imgRGB);

    % 2. District color definitions
    %   (Fill in the correct HSV [0..1] ranges for each district)
   H_TOL = 0.05;
S_TOL = 0.20;
V_TOL = 0.20;

% District 1: Palace Hills
% RGB = [255, 127, 148] -> HSV approx (0.96, 0.50, 1.00)
districtColors(1).name = 'Palace Hills';
districtColors(1).baseHSV = [0.96, 0.50, 1.00];
districtColors(1).H_tol   = 0.05;   % example
districtColors(1).S_tol   = 0.20;
districtColors(1).V_tol   = 0.20;
% districtColors(1).lower = [max(0.96 - H_TOL,0), max(0.50 - S_TOL,0), max(1.00 - V_TOL,0)];
% districtColors(1).upper = [min(0.96 + H_TOL,1), min(0.50 + S_TOL,1), min(1.00 + V_TOL,1)];

% District 2: Northwest
% RGB = [191, 127, 255] -> HSV approx (0.76, 0.50, 1.00)
districtColors(2).name    = 'Northwest';
districtColors(2).baseHSV = [0.76, 0.50, 1.00];
districtColors(2).H_tol   = 0.02;  % narrower hue
districtColors(2).S_tol   = 0.20;
districtColors(2).V_tol   = 0.20;

% districtColors(2).lower = [max(0.76 - H_TOL,0), max(0.50 - S_TOL,0), max(1.00 - V_TOL,0)];
% districtColors(2).upper = [min(0.76 + H_TOL,1), min(0.50 + S_TOL,1), min(1.00 + V_TOL,1)];

% District 3: Old Town
% RGB = [255, 248, 127] -> HSV approx (0.15, 0.50, 1.00)
districtColors(3).name    = 'Old Town';
districtColors(3).baseHSV = [0.15, 0.50, 1.00];
districtColors(3).H_tol   = 0.02;  
districtColors(3).S_tol   = 0.20;
districtColors(3).V_tol   = 0.20;
% districtColors(3).lower = [max(0.15 - H_TOL,0), max(0.50 - S_TOL,0), max(1.00 - V_TOL,0)];
% districtColors(3).upper = [min(0.15 + H_TOL,1), min(0.50 + S_TOL,1), min(1.00 + V_TOL,1)];

% District 4: Safe Town
% RGB = [255, 127, 240] -> HSV approx (0.90, 0.50, 1.00)
districtColors(4).name = 'Safe Town';
districtColors(4).baseHSV = [0.90, 0.50, 1.00];
districtColors(4).H_tol   = 0.05;
districtColors(4).S_tol   = 0.20;
districtColors(4).V_tol   = 0.20;
% districtColors(4).lower = [max(0.90 - H_TOL,0), max(0.50 - S_TOL,0), max(1.00 - V_TOL,0)];
% districtColors(4).upper = [min(0.90 + H_TOL,1), min(0.50 + S_TOL,1), min(1.00 + V_TOL,1)];

% District 5: Southwest
% RGB = [255, 197, 127] -> HSV approx (0.08, 0.50, 1.00)
districtColors(5).name    = 'Southwest';
districtColors(5).baseHSV = [0.08, 0.50, 1.00];
districtColors(5).H_tol   = 0.03;  
districtColors(5).S_tol   = 0.20;
districtColors(5).V_tol   = 0.20;
% districtColors(5).lower = [max(0.08 - H_TOL,0), max(0.50 - S_TOL,0), max(1.00 - V_TOL,0)];
% districtColors(5).upper = [min(0.08 + H_TOL,1), min(0.50 + S_TOL,1), min(1.00 + V_TOL,1)];

% District 6: Downtown
% RGB = [127, 212, 255] -> HSV approx (0.57, 0.50, 1.00)
districtColors(6).name    = 'Downtown';
districtColors(6).baseHSV = [0.57, 0.50, 1.00];
districtColors(6).H_tol   = 0.03;  
districtColors(6).S_tol   = 0.20;
districtColors(6).V_tol   = 0.20;
% districtColors(6).lower = [max(0.57 - H_TOL,0), max(0.50 - S_TOL,0), max(1.00 - V_TOL,0)];
% districtColors(6).upper = [min(0.57 + H_TOL,1), min(0.50 + S_TOL,1), min(1.00 + V_TOL,1)];

% District 7: Wilson Forest
% RGB = [130, 185, 127] -> HSV approx (0.34, 0.31, 0.73)
districtColors(7).name = 'Wilson Forest';
districtColors(7).baseHSV = [0.34, 0.31, 0.73]; 
districtColors(7).H_tol   = 0.06;  % Slightly bigger hue range if it’s missing chunks
districtColors(7).S_tol   = 0.25;
districtColors(7).V_tol   = 0.25;
% districtColors(7).lower = [max(0.34 - H_TOL,0), max(0.31 - S_TOL,0), max(0.73 - V_TOL,0)];
% districtColors(7).upper = [min(0.34 + H_TOL,1), min(0.31 + S_TOL,1), min(0.73 + V_TOL,1)];

% District 8: Scenic Vista
% RGB = [255, 248, 127] -> same as Old Town => approx (0.15, 0.50, 1.00)
districtColors(8).name    = 'Scenic Vista'; % same base color as Old Town
districtColors(8).baseHSV = [0.15, 0.50, 1.00];
% If Old Town used H_tol=0.03, let's try shifting Scenic Vista a bit narrower
districtColors(8).H_tol   = 0.02;  
districtColors(8).S_tol   = 0.20;
districtColors(8).V_tol   = 0.20;
% districtColors(8).lower = [max(0.15 - H_TOL,0), max(0.50 - S_TOL,0), max(1.00 - V_TOL,0)];
% districtColors(8).upper = [min(0.15 + H_TOL,1), min(0.50 + S_TOL,1), min(1.00 + V_TOL,1)];

% District 9: Broadview
% RGB = [191, 127, 255] -> same as Northwest => approx (0.76, 0.50, 1.00)
districtColors(9).name    = 'Broadview';
districtColors(9).baseHSV = [0.76, 0.50, 1.00];
districtColors(9).H_tol   = 0.04;  % slightly bigger hue
districtColors(9).S_tol   = 0.20;
districtColors(9).V_tol   = 0.20;
% districtColors(9).lower = [max(0.76 - H_TOL,0), max(0.50 - S_TOL,0), max(1.00 - V_TOL,0)];
% districtColors(9).upper = [min(0.76 + H_TOL,1), min(0.50 + S_TOL,1), min(1.00 + V_TOL,1)];

% District 10: Chapparal
% RGB = [127, 255, 255] -> HSV approx (0.50, 0.50, 1.00)
districtColors(10).name    = 'Chapparal';
districtColors(10).baseHSV = [0.50, 0.50, 1.00];
districtColors(10).H_tol   = 0.02; 
districtColors(10).S_tol   = 0.20;
districtColors(10).V_tol   = 0.20;
% districtColors(10).lower = [max(0.50 - H_TOL,0), max(0.50 - S_TOL,0), max(1.00 - V_TOL,0)];
% districtColors(10).upper = [min(0.50 + H_TOL,1), min(0.50 + S_TOL,1), min(1.00 + V_TOL,1)];

% District 11: Terrapin Springs
% RGB = [255, 212, 127] -> approx (0.08, 0.50, 1.00)
districtColors(11).name    = 'Terrapin Springs';
districtColors(11).baseHSV = [0.08, 0.50, 1.00];
districtColors(11).H_tol   = 0.03; 
districtColors(11).S_tol   = 0.15;  % narrower saturation
districtColors(11).V_tol   = 0.20;
% districtColors(11).lower = [max(0.08 - H_TOL,0), max(0.50 - S_TOL,0), max(1.00 - V_TOL,0)];
% districtColors(11).upper = [min(0.08 + H_TOL,1), min(0.50 + S_TOL,1), min(1.00 + V_TOL,1)];

% District 12: Pepper Mill
% RGB = [255, 127, 127] -> approx (0.00, 0.50, 1.00)
districtColors(12).name    = 'Pepper Mill';
districtColors(12).baseHSV = [0.00, 0.50, 1.00];
districtColors(12).H_tol   = 0.00;  % zero hue
districtColors(12).S_tol   = 0.20;
districtColors(12).V_tol   = 0.20;
% districtColors(12).lower = [max(0.00 - H_TOL,0), max(0.50 - S_TOL,0), max(1.00 - V_TOL,0)];
% districtColors(12).upper = [min(0.00 + H_TOL,1), min(0.50 + S_TOL,1), min(1.00 + V_TOL,1)];

% District 13: Cheddar-ford
% RGB = [127, 221, 255] -> approx (0.55, 0.50, 1.00)
districtColors(13).name   = 'Cheddar-ford';
districtColors(13).baseHSV= [0.55, 0.50, 1.00];
districtColors(13).H_tol  = 0.02;  
districtColors(13).S_tol  = 0.20;
districtColors(13).V_tol  = 0.20;
% districtColors(13).lower = [max(0.55 - H_TOL,0), max(0.50 - S_TOL,0), max(1.00 - V_TOL,0)];
% districtColors(13).upper = [min(0.55 + H_TOL,1), min(0.50 + S_TOL,1), min(1.00 + V_TOL,1)];

% District 14: Easton
% RGB = [127, 255, 240] -> approx (0.46, 0.50, 1.00)
districtColors(14).name    = 'Easton';
districtColors(14).baseHSV = [0.46, 0.50, 1.00];
districtColors(14).H_tol   = 0.04;  
districtColors(14).S_tol   = 0.20;
districtColors(14).V_tol   = 0.20;
% districtColors(14).lower = [max(0.46 - H_TOL,0), max(0.50 - S_TOL,0), max(1.00 - V_TOL,0)];
% districtColors(14).upper = [min(0.46 + H_TOL,1), min(0.50 + S_TOL,1), min(1.00 + V_TOL,1)];

% District 15: Weston
% RGB = [132, 127, 255] -> approx (0.69, 0.50, 1.00)
districtColors(15).name = 'Weston';
districtColors(15).baseHSV = [0.69, 0.50, 1.00];
districtColors(15).H_tol   = 0.04;
districtColors(15).S_tol   = 0.20;
districtColors(15).V_tol   = 0.20;
% districtColors(15).lower = [max(0.69 - H_TOL,0), max(0.50 - S_TOL,0), max(1.00 - V_TOL,0)];
% districtColors(15).upper = [min(0.69 + H_TOL,1), min(0.50 + S_TOL,1), min(1.00 + V_TOL,1)];

% District 16: Southton
% RGB = [170, 255, 127] -> approx (0.30, 0.50, 1.00)
districtColors(16).name = 'Southton';
districtColors(16).baseHSV = [0.30, 0.50, 1.00];
districtColors(16).H_tol   = 0.05;
districtColors(16).S_tol   = 0.20;
districtColors(16).V_tol   = 0.20;
% districtColors(16).lower = [max(0.30 - H_TOL,0), max(0.50 - S_TOL,0), max(1.00 - V_TOL,0)];
% districtColors(16).upper = [min(0.30 + H_TOL,1), min(0.50 + S_TOL,1), min(1.00 + V_TOL,1)];

% District 17: Oak Willow
% RGB = [255, 251, 127] -> approx (0.15, 0.50, 1.00)
districtColors(17).name   = 'Oak Willow';
districtColors(17).baseHSV= [0.15, 0.50, 1.00];
districtColors(17).H_tol  = 0.00;  % extremely narrow hue
districtColors(17).S_tol  = 0.25;  % let saturation vary
districtColors(17).V_tol  = 0.20;
% districtColors(17).lower = [max(0.15 - H_TOL,0), max(0.50 - S_TOL,0), max(1.00 - V_TOL,0)];
% districtColors(17).upper = [min(0.15 + H_TOL,1), min(0.50 + S_TOL,1), min(1.00 + V_TOL,1)];

% District 18: East Parton
% RGB = [255, 208, 127] -> approx (0.08, 0.50, 1.00)
districtColors(18).name   = 'East Parton';
districtColors(18).baseHSV= [0.08, 0.50, 1.00];
districtColors(18).H_tol  = 0.01;  
districtColors(18).S_tol  = 0.25;
districtColors(18).V_tol  = 0.20;
% districtColors(18).lower = [max(0.08 - H_TOL,0), max(0.50 - S_TOL,0), max(1.00 - V_TOL,0)];
% districtColors(18).upper = [min(0.08 + H_TOL,1), min(0.50 + S_TOL,1), min(1.00 + V_TOL,1)];

% District 19: West Parton
% RGB = [255, 127, 127] -> same as Pepper Mill => approx (0.00, 0.50, 1.00)
districtColors(19).name    = 'West Parton';
districtColors(19).baseHSV = [0.00, 0.50, 1.00];
districtColors(19).H_tol   = 0.02;  % small hue slice
districtColors(19).S_tol   = 0.25;
districtColors(19).V_tol   = 0.20;
    % Repeat for all 19 districts ...
    % districtColors(2).name  = 'Northwest';
    % districtColors(2).lower = [...];
    % districtColors(2).upper = [...];
numDistricts = length(districtColors);

    % 2. Prepare a GeoJSON-like structure in pixel coordinates
    S.type = 'FeatureCollection';
    S.features = {};
    featIndex = 1;

    % Optionally do morphological ops
    se = strel('disk', 3);

    for i = 1 : numDistricts
        dName   = districtColors(i).name;
        baseHSV = districtColors(i).baseHSV;   % e.g. [H, S, V]
        H_tol   = districtColors(i).H_tol;
        S_tol   = districtColors(i).S_tol;
        V_tol   = districtColors(i).V_tol;

        % 3. Compute lower/upper from baseHSV ± tolerance
        H_lower = max(baseHSV(1) - H_tol, 0);
        H_upper = min(baseHSV(1) + H_tol, 1);
        S_lower = max(baseHSV(2) - S_tol, 0);
        S_upper = min(baseHSV(2) + S_tol, 1);
        V_lower = max(baseHSV(3) - V_tol, 0);
        V_upper = min(baseHSV(3) + V_tol, 1);

        lower = [H_lower, S_lower, V_lower];
        upper = [H_upper, S_upper, V_upper];

        % 4. Create mask for this district
        mask = (imgHSV(:,:,1) >= lower(1) & imgHSV(:,:,1) <= upper(1)) & ...
               (imgHSV(:,:,2) >= lower(2) & imgHSV(:,:,2) <= upper(2)) & ...
               (imgHSV(:,:,3) >= lower(3) & imgHSV(:,:,3) <= upper(3));

        % Fill holes, close gaps if needed
        mask = imclose(mask, se);
        mask = imfill(mask, 'holes');

        % 5. Find boundaries (polygons)
        [B, ~] = bwboundaries(mask, 'noholes');
        if isempty(B)
            fprintf('No polygons found for "%s". Check HSV range.\n', dName);
            continue;
        end

        % For each polygon, build a GeoJSON feature
        for bIdx = 1 : length(B)
            boundary = B{bIdx};  % Nx2 array of [row, col]

            % Convert [row,col] -> [x,y] in pixel space
            % x=col, y=row
            polyXY = zeros(size(boundary,1), 2);
            for j = 1 : size(boundary,1)
                r = boundary(j,1);
                c = boundary(j,2);
                polyXY(j,:) = [c, r];
            end

            % Build the feature
            feat.type = 'Feature';
            feat.geometry.type = 'Polygon';
            feat.geometry.coordinates = { polyXY };
            feat.properties.name = dName;
            feat.properties.id   = i;  % or a different ID if needed
            feat.properties.damage_score = 0; % placeholder

            % Add to the FeatureCollection
            S.features{featIndex} = feat;
            featIndex = featIndex + 1;
        end
    end

    % 6. Save as a JSON file (pixel-based polygons)
    geojsonText = jsonencode(S);
    outFile = 'st_himark_color_extracted_pixels234.geojson';
    fid = fopen(outFile, 'w');
    fwrite(fid, geojsonText, 'char');
    fclose(fid);

    fprintf('Saved pixel-based GeoJSON to "%s"\n', outFile);
end

