USE NeuroEcomBI;
GO

-- Clear existing products and related history to avoid foreign key issues
DELETE FROM ProductSalesHistory;
DELETE FROM OrderItems;
DELETE FROM Returns;
DELETE FROM AdPerformance;
DELETE FROM AdCampaigns;
DELETE FROM Products;
GO

-- Reset identity if needed (optional)
DBCC CHECKIDENT ('Products', RESEED, 0);
GO

-- Insert 30 new products
INSERT INTO Products (Name, SKU, Category, Description, Price, Cost, Stock, ReorderLevel, ImageUrl, IsActive, CreatedAt, UpdatedAt) VALUES
('Smart LED Bulb RGBW', 'LED-001', 'Lighting', 'High-quality 10W Smart LED bulb with 16 million colors and voice control compatibility.', 15.99, 6.50, 500, 50, '/products/led_bulb.png', 1, GETDATE(), GETDATE()),
('Industrial Flood Light 100W', 'LED-002', 'Lighting', 'Heavy-duty 100W outdoor LED flood light, IP65 waterproof, 10000 lumens.', 45.00, 22.00, 150, 20, '/products/flood_light.png', 1, GETDATE(), GETDATE()),
('Modern Pendant Light Brass', 'LGT-003', 'Lighting', 'Elegant brushed brass pendant light for dining areas and modern interiors.', 89.99, 35.00, 80, 15, '/products/pendant_light.png', 1, GETDATE(), GETDATE()),
('Solar Path Lights (Set of 4)', 'LGT-004', 'Lighting', 'Set of 4 solar-powered outdoor garden stake lights, stainless steel finish.', 39.99, 18.00, 200, 40, '/products/solar_lights.png', 1, GETDATE(), GETDATE()),
('Motion Sensor Outdoor Light', 'LGT-005', 'Lighting', 'Twin-head motion activated security light, 180-degree detection range.', 29.99, 12.00, 120, 25, '/products/motion_light.png', 1, GETDATE(), GETDATE()),
('Smart Wi-Fi Plug Mini', 'SHT-001', 'Smart Home', 'Compact Wi-Fi smart plug with energy monitoring and schedule settings.', 12.99, 5.00, 450, 60, 'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&q=80&w=800', 1, GETDATE(), GETDATE()),
('Video Doorbell Pro', 'SHT-002', 'Smart Home', '1080p HD video doorbell with two-way talk and advanced motion detection.', 129.99, 65.00, 65, 10, 'https://images.unsplash.com/photo-1512428559083-a4979b2b51ff?auto=format&fit=crop&q=80&w=800', 1, GETDATE(), GETDATE()),
('Smart Thermostat V2', 'SHT-003', 'Smart Home', 'Intelligent learning thermostat with remote control and HVAC optimization.', 199.99, 95.00, 40, 5, 'https://images.unsplash.com/photo-1567924675637-283a6742993e?auto=format&fit=crop&q=80&w=800', 1, GETDATE(), GETDATE()),
('Hub Controller (Zigbee)', 'SHT-004', 'Smart Home', 'Central hub for connecting and managing Zigbee smart home devices.', 59.99, 28.00, 90, 15, 'https://images.unsplash.com/photo-1558489580-faa74691fdc5?auto=format&fit=crop&q=80&w=800', 1, GETDATE(), GETDATE()),
('Air Quality Monitor', 'SHT-005', 'Smart Home', 'Real-time indoor air quality monitor for CO2, VOCs, humidity, and temperature.', 79.99, 38.00, 110, 20, 'https://images.unsplash.com/photo-1585336261022-680e295ce3fe?auto=format&fit=crop&q=80&w=800', 1, GETDATE(), GETDATE()),
('Circuit Breaker 100A 3-Phase', 'IND-001', 'Industrial', 'High-performance 3-pole circuit breaker for industrial power distribution.', 150.00, 75.00, 30, 5, 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=800', 1, GETDATE(), GETDATE()),
('Industrial Contactors 220V', 'IND-002', 'Industrial', 'Magnetic AC contactor for heavy motor control and automation systems.', 45.00, 20.00, 180, 30, 'https://images.unsplash.com/photo-1621905252507-b352224adbb2?auto=format&fit=crop&q=80&w=800', 1, GETDATE(), GETDATE()),
('Digital Multimeter Pro', 'IND-003', 'Industrial', 'True RMS digital multimeter with NCV, auto-ranging, and backlit display.', 85.00, 40.00, 75, 12, 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&q=80&w=800', 1, GETDATE(), GETDATE()),
('Isolation Transformer 1KVA', 'IND-004', 'Industrial', '1KVA step-down isolation transformer for sensitive equipment protection.', 250.00, 140.00, 15, 3, 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&q=80&w=800', 1, GETDATE(), GETDATE()),
('DIN Rail Power Supply 24V', 'IND-005', 'Industrial', '24V DC 5A industrial DIN rail mount power supply with surge protection.', 35.00, 15.00, 140, 25, 'https://images.unsplash.com/photo-1621905251918-48416bd8575a?auto=format&fit=crop&q=80&w=800', 1, GETDATE(), GETDATE()),
('12/2 Romex Wire 50ft', 'WIR-001', 'Wiring', 'Solid copper electrical wire for residential indoor circuit wiring.', 49.99, 32.00, 250, 50, 'https://images.unsplash.com/photo-1617471346061-5d329ab9c574?auto=format&fit=crop&q=80&w=800', 1, GETDATE(), GETDATE()),
('Ethernet Cable Cat6 100ft', 'WIR-002', 'Wiring', 'Premium Cat6 ethernet cable with gold-plated connectors for high-speed networking.', 19.99, 8.00, 600, 100, 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&q=80&w=800', 1, GETDATE(), GETDATE()),
('Heavy Duty Extension Cord 25ft', 'WIR-003', 'Wiring', 'Outdoor-rated heavy duty extension cord with lighted plug.', 24.99, 11.00, 320, 60, 'https://images.unsplash.com/photo-1563206767-5b18f218e7de?auto=format&fit=crop&q=80&w=800', 1, GETDATE(), GETDATE()),
('Terminal Block Kit (100pcs)', 'WIR-004', 'Wiring', 'Assorted terminal blocks for secure electrical connections and junctions.', 15.99, 6.00, 500, 80, 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=800', 1, GETDATE(), GETDATE()),
('Heat Shrink Tubing Assortment', 'WIR-005', 'Wiring', 'Multi-size polyolefin heat shrink tubing kit for wire insulation.', 12.99, 4.00, 400, 70, 'https://images.unsplash.com/photo-1621905252507-b352224adbb2?auto=format&fit=crop&q=80&w=800', 1, GETDATE(), GETDATE()),
('Cordless Drill Set 20V', 'TOL-001', 'Tools', 'High-torque 20V cordless drill with 2 batteries and fast charger.', 99.00, 45.00, 85, 10, 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&q=80&w=800', 1, GETDATE(), GETDATE()),
('Soldering Station 60W', 'TOL-002', 'Tools', 'Precision temperature controlled soldering station for electronics repair.', 49.99, 22.00, 120, 20, 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=800', 1, GETDATE(), GETDATE()),
('Wire Stripper & Crimper Tool', 'TOL-003', 'Tools', 'Professional grade self-adjusting wire stripper and terminal crimper.', 18.50, 7.50, 240, 40, 'https://images.unsplash.com/photo-1581092334651-dd3c60402239?auto=format&fit=crop&q=80&w=800', 1, GETDATE(), GETDATE()),
('Electrician Tool Bag', 'TOL-004', 'Tools', 'Rugged tool carrier with 28 pockets and molded waterproof base.', 35.00, 16.00, 160, 25, 'https://images.unsplash.com/photo-1581092162384-8987c17b492a?auto=format&fit=crop&q=80&w=800', 1, GETDATE(), GETDATE()),
('Laser Level Self-Leveling', 'TOL-005', 'Tools', '360-degree green beam cross line laser level with magnetic base.', 55.00, 25.00, 70, 12, 'https://images.unsplash.com/photo-1581092921461-7d206f5223c6?auto=format&fit=crop&q=80&w=800', 1, GETDATE(), GETDATE()),
('Surge Protector 10-Outlet', 'PWR-001', 'Power', '4000 Joules power strip with USB ports and flat plug.', 29.99, 12.00, 380, 50, 'https://images.unsplash.com/photo-1591405351990-4726e33df58d?auto=format&fit=crop&q=80&w=800', 1, GETDATE(), GETDATE()),
('Rechargeable AA Batteries (8pk)', 'PWR-002', 'Power', 'Low self-discharge Ni-MH rechargeable batteries, 2500mAh.', 19.99, 9.00, 500, 100, 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&q=80&w=800', 1, GETDATE(), GETDATE()),
('Portable Power Bank 20000mAh', 'PWR-003', 'Power', 'High-capacity fast charging power bank with PD 3.0 technology.', 45.00, 21.00, 220, 40, 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&q=80&w=800', 1, GETDATE(), GETDATE()),
('Uninterruptible Power Supply (UPS)', 'PWR-004', 'Power', '1500VA Battery backup with AVR for home office protection.', 120.00, 65.00, 45, 8, 'https://images.unsplash.com/photo-1591405351990-4726e33df58d?auto=format&fit=crop&q=80&w=800', 1, GETDATE(), GETDATE()),
('Solar Panel Portable 60W', 'PWR-005', 'Power', 'Foldable monocrystalline solar panel for camping and emergency power.', 150.00, 80.00, 60, 10, 'https://images.unsplash.com/photo-1509391366360-fe5bb58583bb?auto=format&fit=crop&q=80&w=800', 1, GETDATE(), GETDATE());
GO

PRINT '✅ 30 products inserted successfully.';
GO
