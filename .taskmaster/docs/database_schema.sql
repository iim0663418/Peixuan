-- Users Table
CREATE TABLE Users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255), -- For email/password login
    auth_provider VARCHAR(50), -- e.g., 'email', 'google', 'facebook'
    provider_id VARCHAR(255), -- ID from OAuth provider
    role VARCHAR(50) DEFAULT 'member' NOT NULL, -- e.g., 'anonymous', 'member', 'vip', 'admin'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- UserProfiles Table
CREATE TABLE UserProfiles (
    user_id INTEGER PRIMARY KEY REFERENCES Users(id) ON DELETE CASCADE,
    name VARCHAR(255),
    preferences JSONB, -- For storing user-specific app settings
    settings JSONB, -- Other settings
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- AstrologyRecords Table (Stores basic birth information for a calculation)
CREATE TABLE AstrologyRecords (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES Users(id) ON DELETE SET NULL, -- Allow anonymous records or keep if user deleted
    device_id VARCHAR(255), -- For anonymous users
    birth_date DATE NOT NULL,
    birth_time TIME WITH TIME ZONE NOT NULL,
    birth_location VARCHAR(255), -- Could be city name or coordinates
    record_type VARCHAR(50) NOT NULL, -- e.g., 'bazi', 'ziwei'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- BaziCharts Table (Stores Bazi calculation results)
CREATE TABLE BaziCharts (
    id SERIAL PRIMARY KEY,
    record_id INTEGER UNIQUE NOT NULL REFERENCES AstrologyRecords(id) ON DELETE CASCADE,
    chart_data JSONB NOT NULL, -- Detailed Bazi chart components
    analysis_data JSONB -- Interpretation and analysis
);

-- PurpleStarCharts Table (Stores Zi Wei Dou Shu calculation results)
CREATE TABLE PurpleStarCharts (
    id SERIAL PRIMARY KEY,
    record_id INTEGER UNIQUE NOT NULL REFERENCES AstrologyRecords(id) ON DELETE CASCADE,
    chart_data JSONB NOT NULL, -- Detailed Zi Wei chart components (palaces, stars)
    analysis_data JSONB -- Interpretation and analysis
);

-- HistoricalQueries Table (Stores user's interaction history with specific charts)
CREATE TABLE HistoricalQueries (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES Users(id) ON DELETE SET NULL,
    record_id INTEGER REFERENCES AstrologyRecords(id) ON DELETE CASCADE, -- Link to the specific chart
    query_type VARCHAR(100) NOT NULL, -- e.g., 'annual_fate', 'relationship_analysis'
    query_parameters JSONB, -- Parameters used for the query
    query_result JSONB, -- Result of the query
    notes TEXT, -- User notes on this query
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- AnonymousUsers Table (Temporary storage for anonymous user data before potential merge)
CREATE TABLE AnonymousUsers (
    device_id VARCHAR(255) PRIMARY KEY,
    temp_data JSONB, -- Stores unsaved charts or preferences
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_active TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for frequently queried fields
CREATE INDEX idx_users_email ON Users(email);
CREATE INDEX idx_astrologyrecords_user_id ON AstrologyRecords(user_id);
CREATE INDEX idx_astrologyrecords_device_id ON AstrologyRecords(device_id);
CREATE INDEX idx_historicalqueries_user_id ON HistoricalQueries(user_id);
CREATE INDEX idx_historicalqueries_record_id ON HistoricalQueries(record_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to update updated_at on Users table
CREATE TRIGGER set_timestamp_users
BEFORE UPDATE ON Users
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Triggers to update updated_at on UserProfiles table
CREATE TRIGGER set_timestamp_userprofiles
BEFORE UPDATE ON UserProfiles
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();
