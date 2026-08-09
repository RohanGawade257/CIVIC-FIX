const Report = require("../../models/Report");
const User = require("../../models/User");
const sanitizeReport = require("../../utils/sanitizeReport");

const DEFAULT_RADIUS_KM = 5;
const MAX_RADIUS_KM = 50;
const EARTH_RADIUS_KM = 6371;

function parseRadiusKm(rawRadius) {
  const km = Number(rawRadius);
  if (Number.isNaN(km) || km <= 0) {
    return DEFAULT_RADIUS_KM;
  }
  return Math.min(km, MAX_RADIUS_KM);
}

function parsePagination(rawPage, rawLimit) {
  const page = Math.max(1, Math.floor(Number(rawPage) || 1));
  const limit = Math.min(50, Math.max(1, Math.floor(Number(rawLimit) || 20)));
  return { page, limit, skip: (page - 1) * limit };
}

function buildGeoNearStage(longitude, latitude, radiusKm) {
  return {
    $geoNear: {
      near: { type: "Point", coordinates: [longitude, latitude] },
      distanceField: "distanceMeters",
      maxDistance: radiusKm * 1000,
      spherical: true,
      key: "location.point",
    },
  };
}

function buildMatchStage(filters) {
  const match = {};

  if (filters.category) {
    match.category = filters.category;
  }

  if (filters.status) {
    match.status = filters.status;
  } else {
    match.status = {
      $nin: ["DRAFT", "REJECTED"],
    };
  }

  return { $match: match };
}

function buildSortStage() {
  return {
    $sort: {
      priority: -1,
      distanceMeters: 1,
      createdAt: -1,
    },
  };
}

async function queryCivicFeed({ longitude, latitude, radiusKm, category, status, page, limit }) {
  const parsedRadius = parseRadiusKm(radiusKm);
  const { page: parsedPage, limit: parsedLimit, skip } = parsePagination(page, limit);

  const pipeline = [
    buildGeoNearStage(longitude, latitude, parsedRadius),
    buildMatchStage({ category, status }),
    buildSortStage(),
    {
      $facet: {
        results: [{ $skip: skip }, { $limit: parsedLimit }],
        totalCount: [{ $count: "count" }],
      },
    },
  ];

  const [aggregationResult] = await Report.aggregate(pipeline);

  const reports = (aggregationResult?.results || []).map((doc) => {
    const sanitized = sanitizeReport(doc);
    sanitized.distanceMeters = Math.round(doc.distanceMeters || 0);
    return sanitized;
  });

  const totalCount = aggregationResult?.totalCount?.[0]?.count || 0;
  const totalPages = Math.ceil(totalCount / parsedLimit);

  return {
    reports,
    pagination: {
      page: parsedPage,
      limit: parsedLimit,
      totalCount,
      totalPages,
    },
    query: {
      latitude,
      longitude,
      radiusKm: parsedRadius,
    },
  };
}

async function getCivicFeedForUser(userId, queryParams) {
  const user = await User.findById(userId).select("preferredLocation").lean();

  let longitude;
  let latitude;

  if (queryParams.longitude !== undefined && queryParams.latitude !== undefined) {
    longitude = Number(queryParams.longitude);
    latitude = Number(queryParams.latitude);
  } else if (
    user?.preferredLocation?.point?.coordinates?.length === 2
  ) {
    [longitude, latitude] = user.preferredLocation.point.coordinates;
  } else {
    return {
      reports: [],
      pagination: { page: 1, limit: 20, totalCount: 0, totalPages: 0 },
      query: { latitude: null, longitude: null, radiusKm: DEFAULT_RADIUS_KM },
      message: "Set a preferred location or provide longitude and latitude query parameters.",
    };
  }

  if (
    Number.isNaN(longitude)
    || Number.isNaN(latitude)
    || longitude < -180
    || longitude > 180
    || latitude < -90
    || latitude > 90
  ) {
    return {
      reports: [],
      pagination: { page: 1, limit: 20, totalCount: 0, totalPages: 0 },
      query: { latitude, longitude, radiusKm: DEFAULT_RADIUS_KM },
      message: "Invalid coordinates.",
    };
  }

  return queryCivicFeed({
    longitude,
    latitude,
    radiusKm: queryParams.radiusKm,
    category: queryParams.category,
    status: queryParams.status,
    page: queryParams.page,
    limit: queryParams.limit,
  });
}

async function getPublicFeed(queryParams) {
  const longitude = Number(queryParams.longitude);
  const latitude = Number(queryParams.latitude);

  if (
    Number.isNaN(longitude)
    || Number.isNaN(latitude)
    || longitude < -180
    || longitude > 180
    || latitude < -90
    || latitude > 90
  ) {
    return {
      reports: [],
      pagination: { page: 1, limit: 20, totalCount: 0, totalPages: 0 },
      query: { latitude: null, longitude: null, radiusKm: DEFAULT_RADIUS_KM },
      message: "Provide valid longitude and latitude query parameters.",
    };
  }

  return queryCivicFeed({
    longitude,
    latitude,
    radiusKm: queryParams.radiusKm,
    category: queryParams.category,
    status: queryParams.status,
    page: queryParams.page,
    limit: queryParams.limit,
  });
}

module.exports = {
  queryCivicFeed,
  getCivicFeedForUser,
  getPublicFeed,
  parseRadiusKm,
  parsePagination,
  DEFAULT_RADIUS_KM,
  MAX_RADIUS_KM,
};
