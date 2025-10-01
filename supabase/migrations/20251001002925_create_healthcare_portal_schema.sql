/*
  # Healthcare Portal Schema - MVP
  
  ## Overview
  Complete database schema for a secure healthcare coordination portal enabling 
  appointment scheduling, teleconsultations, and medical record access.
  
  ## New Tables
  
  ### 1. `profiles`
  User profile information extending auth.users
  - `id` (uuid, primary key) - Links to auth.users
  - `email` (text) - User email
  - `full_name` (text) - Full name
  - `role` (text) - 'patient' or 'professional'
  - `phone` (text, optional) - Contact phone
  - `specialty` (text, optional) - For professionals only
  - `license_number` (text, optional) - For professionals only
  - `created_at` (timestamptz) - Account creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp
  
  ### 2. `availability_slots`
  Professional availability for appointments
  - `id` (uuid, primary key)
  - `professional_id` (uuid) - References profiles
  - `day_of_week` (integer) - 0=Sunday, 6=Saturday
  - `start_time` (time) - Slot start time
  - `end_time` (time) - Slot end time
  - `is_active` (boolean) - Slot enabled/disabled
  - `created_at` (timestamptz)
  
  ### 3. `appointments`
  Scheduled appointments between patients and professionals
  - `id` (uuid, primary key)
  - `patient_id` (uuid) - References profiles
  - `professional_id` (uuid) - References profiles
  - `appointment_date` (date) - Appointment date
  - `start_time` (time) - Start time
  - `end_time` (time) - End time
  - `type` (text) - 'presencial' or 'virtual'
  - `status` (text) - 'confirmada', 'cancelada', 'completada', 'no-show'
  - `notes` (text, optional) - Additional notes
  - `room_id` (text, optional) - Teleconsultation room identifier
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)
  
  ### 4. `medical_records`
  Patient medical history entries
  - `id` (uuid, primary key)
  - `patient_id` (uuid) - References profiles
  - `professional_id` (uuid) - References profiles (who created record)
  - `appointment_id` (uuid, optional) - Related appointment
  - `record_date` (timestamptz) - Record creation date
  - `diagnosis` (text, optional) - Diagnosis information
  - `treatment` (text, optional) - Treatment plan
  - `notes` (text, optional) - Additional clinical notes
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)
  
  ### 5. `notifications`
  System notifications and appointment reminders
  - `id` (uuid, primary key)
  - `user_id` (uuid) - References profiles
  - `type` (text) - 'reminder', 'cancellation', 'confirmation'
  - `title` (text) - Notification title
  - `message` (text) - Notification content
  - `read` (boolean) - Read status
  - `related_appointment_id` (uuid, optional) - Related appointment
  - `created_at` (timestamptz)
  
  ## Security
  
  Row Level Security (RLS) is enabled on all tables with policies ensuring:
  - Patients can only access their own data
  - Professionals can access their assigned patients' data
  - Professionals can manage their own availability
  - Proper authentication required for all operations
  
  ## Notes
  
  1. All tables use UUIDs for primary keys
  2. Timestamps use timestamptz for timezone awareness
  3. Foreign keys ensure referential integrity
  4. Indexes added for common query patterns
  5. Default values minimize data entry errors
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  role text NOT NULL CHECK (role IN ('patient', 'professional')),
  phone text,
  specialty text,
  license_number text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create availability_slots table
CREATE TABLE IF NOT EXISTS availability_slots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  day_of_week integer NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time time NOT NULL,
  end_time time NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT valid_time_range CHECK (end_time > start_time)
);

ALTER TABLE availability_slots ENABLE ROW LEVEL SECURITY;

-- Create appointments table
CREATE TABLE IF NOT EXISTS appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  professional_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  appointment_date date NOT NULL,
  start_time time NOT NULL,
  end_time time NOT NULL,
  type text NOT NULL CHECK (type IN ('presencial', 'virtual')),
  status text DEFAULT 'confirmada' CHECK (status IN ('confirmada', 'cancelada', 'completada', 'no-show')),
  notes text,
  room_id text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_appointment_time CHECK (end_time > start_time)
);

ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Create indexes for appointments
CREATE INDEX IF NOT EXISTS idx_appointments_patient ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_professional ON appointments(professional_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);

-- Create medical_records table
CREATE TABLE IF NOT EXISTS medical_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  professional_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  appointment_id uuid REFERENCES appointments(id) ON DELETE SET NULL,
  record_date timestamptz DEFAULT now(),
  diagnosis text,
  treatment text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE medical_records ENABLE ROW LEVEL SECURITY;

-- Create indexes for medical_records
CREATE INDEX IF NOT EXISTS idx_medical_records_patient ON medical_records(patient_id);
CREATE INDEX IF NOT EXISTS idx_medical_records_professional ON medical_records(professional_id);
CREATE INDEX IF NOT EXISTS idx_medical_records_date ON medical_records(record_date);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('reminder', 'cancellation', 'confirmation', 'system')),
  title text NOT NULL,
  message text NOT NULL,
  read boolean DEFAULT false,
  related_appointment_id uuid REFERENCES appointments(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Create index for notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, read);

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Professionals can view patient profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    role = 'patient' AND EXISTS (
      SELECT 1 FROM appointments
      WHERE appointments.professional_id = auth.uid()
      AND appointments.patient_id = profiles.id
    )
  );

-- RLS Policies for availability_slots
CREATE POLICY "Professionals can manage own availability"
  ON availability_slots FOR ALL
  TO authenticated
  USING (professional_id = auth.uid())
  WITH CHECK (professional_id = auth.uid());

CREATE POLICY "Anyone can view active availability"
  ON availability_slots FOR SELECT
  TO authenticated
  USING (is_active = true);

-- RLS Policies for appointments
CREATE POLICY "Patients can view own appointments"
  ON appointments FOR SELECT
  TO authenticated
  USING (patient_id = auth.uid());

CREATE POLICY "Professionals can view their appointments"
  ON appointments FOR SELECT
  TO authenticated
  USING (professional_id = auth.uid());

CREATE POLICY "Patients can create appointments"
  ON appointments FOR INSERT
  TO authenticated
  WITH CHECK (patient_id = auth.uid());

CREATE POLICY "Patients can update own appointments"
  ON appointments FOR UPDATE
  TO authenticated
  USING (patient_id = auth.uid())
  WITH CHECK (patient_id = auth.uid());

CREATE POLICY "Professionals can update their appointments"
  ON appointments FOR UPDATE
  TO authenticated
  USING (professional_id = auth.uid())
  WITH CHECK (professional_id = auth.uid());

-- RLS Policies for medical_records
CREATE POLICY "Patients can view own medical records"
  ON medical_records FOR SELECT
  TO authenticated
  USING (patient_id = auth.uid());

CREATE POLICY "Professionals can view assigned patient records"
  ON medical_records FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM appointments
      WHERE appointments.professional_id = auth.uid()
      AND appointments.patient_id = medical_records.patient_id
    )
  );

CREATE POLICY "Professionals can create medical records"
  ON medical_records FOR INSERT
  TO authenticated
  WITH CHECK (
    professional_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'professional'
    )
  );

CREATE POLICY "Professionals can update own medical records"
  ON medical_records FOR UPDATE
  TO authenticated
  USING (professional_id = auth.uid())
  WITH CHECK (professional_id = auth.uid());

-- RLS Policies for notifications
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at
  BEFORE UPDATE ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_medical_records_updated_at
  BEFORE UPDATE ON medical_records
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();