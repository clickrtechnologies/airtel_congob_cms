export interface GeoInfo {
  geoName: string;        // Country
  mnoList: MnoInfo[];     // List of operators
}

export interface MnoInfo {
  mnoName: string;              // Operator name
  years: { [year: string]: string[] }; // Year -> Months mapping
}