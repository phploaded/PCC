(function ($) {
  'use strict';

  var commonOptions = {
    history: true,
    historyShortcuts: true,
    autosave: true,
    restoreDraftPrompt: false
  };

  function cloneCommonOptions() {
    return $.extend(true, {}, commonOptions);
  }

  function contactStep(label, minBudget, maxBudget) {
    return {
      title: 'Client Details',
      fields: [
        {
          type: 'text',
          name: 'client_name',
          label: 'Client Name',
          required: true,
          minlen: 3,
          maxlen: 80,
          pattern: "^[A-Za-z][A-Za-z\\s.'-]{2,79}$",
          msgRequired: 'Client name is required.',
          msgPattern: 'Use letters and standard punctuation only.'
        },
        {
          type: 'text',
          name: 'client_email',
          label: 'Email Address',
          required: true,
          validate: 'email',
          msgRequired: 'Email address is required.',
          msgEmail: 'Enter a valid email address.'
        },
        {
          type: 'text',
          name: 'client_phone',
          label: 'Phone Number',
          required: true,
          minlen: 10,
          maxlen: 20,
          pattern: '^[0-9+()\\-\\s]{10,20}$',
          msgRequired: 'Phone number is required.',
          msgPattern: 'Use numbers with optional + ( ) - characters.'
        },
        {
          type: 'number',
          name: 'target_budget',
          label: label + ' Budget',
          value: minBudget,
          required: true,
          min: minBudget,
          max: maxBudget,
          step: 50,
          validate: 'number'
        },
        {
          type: 'textarea',
          name: 'notes',
          label: 'Project Notes',
          rows: 3,
          maxlen: 450
        },
        {
          type: 'checkbox',
          name: 'consent_ack',
          label: 'I confirm the information above is accurate and ready for follow-up.',
          value: 'yes',
          required: true,
          msgRequired: 'Please confirm accuracy before submitting.'
        }
      ]
    };
  }

  function buildCatalog() {
    return {
      'computer-assembly': {
        title: 'Computer Assembly Shop Quote',
        industry: 'Hardware Retail + Assembly',
        subtitle: 'Price custom desktop builds with hardware tiering, labor load, and deployment extras.',
        themeClass: 'theme-computer',
        schema: {
          title: 'Custom PC Build Estimator',
          currencySymbol: ' USD',
          emailButtonText: 'Email Build Quote',
          locale: 'en-US',
          wizard: true,
          options: cloneCommonOptions(),
          pricing: { taxRate: 7.75, discountPercent: 1.5, discountFixed: 0 },
          steps: [
            {
              title: 'Build Profile',
              fields: [
                {
                  type: 'radio-group',
                  name: 'build_type',
                  label: 'Build Type',
                  required: true,
                  options: [
                    { label: 'Office Starter', value: '480', cost: 'this', checked: true },
                    { label: 'Creator Station', value: '980', cost: 'this' },
                    { label: 'Gaming Apex', value: '1650', cost: 'this' }
                  ]
                },
                { type: 'number', name: 'ram_gb', label: 'RAM (GB)', value: 16, min: 8, max: 256, step: 8, cost: 'this', mult: 4.8, required: true },
                { type: 'number', name: 'storage_tb', label: 'NVMe Storage (TB)', value: 1, min: 1, max: 8, step: 1, cost: 'this', mult: 120, required: true },
                { type: 'number', name: 'gpu_units', label: 'Discrete GPU Units', value: 1, min: 0, max: 4, step: 1, cost: 'this', mult: 420, required: true },
                { type: 'number', name: 'assembly_hours', label: 'Calculated Assembly Hours', formula: '({gpu_units}*1.4)+({ram_gb}/16)+2', formulaPrecision: 1, readonly: true, cost: 'this', mult: 55 }
              ]
            },
            {
              title: 'Delivery and Extras',
              fields: [
                {
                  type: 'checkbox-group',
                  name: 'service_addons',
                  label: 'Build Add-ons',
                  options: [
                    { label: 'OS + Driver Setup', value: '95', cost: 'this' },
                    { label: 'Cable Sleeve and Airflow Tune', value: '60', cost: 'this' },
                    { label: '48-hour Burn-in Stress Test', value: '140', cost: 'this' }
                  ]
                },
                {
                  type: 'radio-group',
                  name: 'delivery_mode',
                  label: 'Delivery Mode',
                  required: true,
                  options: [
                    { label: 'Pickup at Store', value: '0', cost: 'this', checked: true },
                    { label: 'Insured Shipping', value: '90', cost: 'this' },
                    { label: 'Onsite Installation', value: '180', cost: 'this' }
                  ]
                },
                { type: 'number', name: 'onsite_terminals', label: 'Onsite Terminals', value: 1, min: 1, max: 12, cost: 'this', mult: 45, showIf: 'delivery_mode=180' }
              ]
            },
            contactStep('IT Setup', 700, 90000)
          ]
        }
      },
      'web-development': {
        title: 'Web Developer Quotation Form',
        industry: 'Web Agency + Product Engineering',
        subtitle: 'Estimate web projects by scope, page volume, integrations, and launch acceleration.',
        themeClass: 'theme-web',
        schema: {
          title: 'Web Project Proposal Builder',
          currencySymbol: ' USD',
          emailButtonText: 'Email Project Estimate',
          locale: 'en-US',
          wizard: true,
          options: cloneCommonOptions(),
          pricing: { taxRate: 0, discountPercent: 2, discountFixed: 0 },
          steps: [
            {
              title: 'Scope Definition',
              fields: [
                {
                  type: 'radio-group',
                  name: 'project_type',
                  label: 'Project Type',
                  required: true,
                  options: [
                    { label: 'Landing Page', value: '1200', cost: 'this', checked: true },
                    { label: 'Corporate Website', value: '2800', cost: 'this' },
                    { label: 'SaaS Web App', value: '7600', cost: 'this' }
                  ]
                },
                { type: 'number', name: 'pages', label: 'Total Pages / Screens', value: 6, min: 1, max: 140, step: 1, cost: 'this', mult: 180, required: true },
                {
                  type: 'checkbox-group',
                  name: 'integrations',
                  label: 'Integrations',
                  options: [
                    { label: 'CMS Setup', value: '450', cost: 'this' },
                    { label: 'Payment Gateway', value: '680', cost: 'this' },
                    { label: 'CRM Integration', value: '520', cost: 'this' },
                    { label: 'Multilingual Layer', value: '900', cost: 'this' }
                  ]
                },
                { type: 'number', name: 'ui_hours', label: 'Calculated UI/UX Hours', formula: '({pages}*1.8)+6', formulaPrecision: 1, readonly: true, cost: 'this', mult: 85 }
              ]
            },
            {
              title: 'Timeline and Support',
              fields: [
                {
                  type: 'radio-group',
                  name: 'timeline_mode',
                  label: 'Delivery Timeline',
                  required: true,
                  options: [
                    { label: 'Standard Delivery', value: '0', cost: 'this', checked: true },
                    { label: 'Fast-track Delivery', value: '1300', cost: 'this' }
                  ]
                },
                { type: 'number', name: 'weekend_sprints', label: 'Weekend Sprint Blocks', value: 1, min: 1, max: 8, cost: 'this', mult: 220, showIf: 'timeline_mode=1300' },
                {
                  type: 'select',
                  name: 'qa_depth',
                  label: 'QA Depth',
                  required: true,
                  options: [
                    { label: 'Choose QA depth', value: '', selected: true },
                    { label: 'Basic QA', value: 'basic', cost: '0' },
                    { label: 'Regression QA', value: 'regression', cost: '600' },
                    { label: 'Extended QA + Device Matrix', value: 'extended', cost: '1200' }
                  ]
                },
                {
                  type: 'select',
                  name: 'maintenance',
                  label: 'Maintenance Plan',
                  required: true,
                  options: [
                    { label: 'Choose maintenance', value: '', selected: true },
                    { label: 'No Plan', value: 'none', cost: '0' },
                    { label: '3-Month Plan', value: 'm3', cost: '480' },
                    { label: '12-Month Plan', value: 'm12', cost: '1600' }
                  ]
                }
              ]
            },
            contactStep('Web Delivery', 1200, 180000)
          ]
        }
      },
      'solar-installation': {
        title: 'Solar Installation Estimator',
        industry: 'Energy + Home Infrastructure',
        subtitle: 'Model panel system sizing, financing terms, and renewable add-ons.',
        themeClass: 'theme-solar',
        schema: {
          title: 'Residential Solar Proposal',
          currencySymbol: ' USD',
          emailButtonText: 'Email Solar Proposal',
          locale: 'en-US',
          wizard: true,
          options: cloneCommonOptions(),
          pricing: { taxRate: 5.25, discountPercent: 0, discountFixed: 300 },
          steps: [
            {
              title: 'Property Inputs',
              fields: [
                { type: 'number', name: 'roof_area', label: 'Usable Roof Area (sq ft)', value: 1200, min: 250, max: 25000, cost: 'this', mult: 0.65, required: true },
                { type: 'number', name: 'monthly_bill', label: 'Current Monthly Electric Bill', value: 240, min: 60, max: 3000, cost: 'this', mult: 1.2, required: true },
                {
                  type: 'select',
                  name: 'panel_type',
                  label: 'Panel Tier',
                  required: true,
                  options: [
                    { label: 'Choose panel tier', value: '', selected: true },
                    { label: 'Standard Efficiency', value: 'std', cost: '3200' },
                    { label: 'Premium Efficiency', value: 'prem', cost: '4800' }
                  ]
                },
                { type: 'number', name: 'system_kw', label: 'Estimated System Size (kW)', formula: '({roof_area}/110)+1', formulaPrecision: 1, readonly: true, cost: 'this', mult: 950 }
              ]
            },
            {
              title: 'Storage and Financing',
              fields: [
                {
                  type: 'checkbox-group',
                  name: 'energy_addons',
                  label: 'Energy Add-ons',
                  options: [
                    { label: 'Battery Backup', value: '4200', cost: 'this' },
                    { label: 'EV Charger Integration', value: '950', cost: 'this' },
                    { label: 'Monitoring Upgrade', value: '380', cost: 'this' }
                  ]
                },
                {
                  type: 'radio-group',
                  name: 'payment_plan',
                  label: 'Payment Mode',
                  required: true,
                  options: [
                    { label: 'Cash Purchase', value: '0', cost: 'this', checked: true },
                    { label: '5-Year Financing', value: '2400', cost: 'this' },
                    { label: '10-Year Financing', value: '4800', cost: 'this' }
                  ]
                }
              ]
            },
            contactStep('Solar Project', 5000, 250000)
          ]
        }
      },
      'wedding-photography': {
        title: 'Wedding Photography Packages',
        industry: 'Events + Photography Studio',
        subtitle: 'Quote wedding coverage with timeline, second shooters, and delivery speed options.',
        themeClass: 'theme-wedding',
        schema: {
          title: 'Wedding Coverage Estimator',
          currencySymbol: ' USD',
          emailButtonText: 'Email Coverage Quote',
          locale: 'en-US',
          wizard: true,
          options: cloneCommonOptions(),
          pricing: { taxRate: 0, discountPercent: 1, discountFixed: 0 },
          steps: [
            {
              title: 'Coverage Details',
              fields: [
                {
                  type: 'radio-group',
                  name: 'package',
                  label: 'Photography Package',
                  required: true,
                  options: [
                    { label: 'Essentials', value: '1400', cost: 'this', checked: true },
                    { label: 'Signature', value: '2600', cost: 'this' },
                    { label: 'Luxury', value: '4300', cost: 'this' }
                  ]
                },
                { type: 'number', name: 'event_hours', label: 'Event Hours', value: 6, min: 2, max: 16, cost: 'this', mult: 180, required: true },
                { type: 'number', name: 'extra_photographers', label: 'Extra Photographers', value: 1, min: 0, max: 3, cost: 'this', mult: 350, required: true },
                { type: 'number', name: 'album_pages', label: 'Suggested Album Pages', formula: '({event_hours}*4)+20', formulaPrecision: 0, readonly: true, cost: 'this', mult: 6 }
              ]
            },
            {
              title: 'Delivery and Add-ons',
              fields: [
                {
                  type: 'select',
                  name: 'delivery_speed',
                  label: 'Delivery Timeline',
                  required: true,
                  options: [
                    { label: 'Choose timeline', value: '', selected: true },
                    { label: 'Standard Delivery', value: 'std', cost: '0' },
                    { label: 'Rush Delivery', value: 'rush', cost: '380' },
                    { label: 'Same Week Delivery', value: 'same', cost: '800' }
                  ]
                },
                {
                  type: 'checkbox-group',
                  name: 'extras',
                  label: 'Add-on Coverage',
                  options: [
                    { label: 'Drone Footage', value: '420', cost: 'this' },
                    { label: 'Rehearsal Coverage', value: '350', cost: 'this' },
                    { label: 'Engagement Session', value: '500', cost: 'this' },
                    { label: 'Ceremony Livestream', value: '650', cost: 'this' }
                  ]
                },
                {
                  type: 'radio-group',
                  name: 'travel_zone',
                  label: 'Travel Zone',
                  required: true,
                  options: [
                    { label: 'Local Venue', value: '0', cost: 'this', checked: true },
                    { label: 'Regional Venue', value: '280', cost: 'this' },
                    { label: 'Destination Venue', value: '1200', cost: 'this' }
                  ]
                }
              ]
            },
            contactStep('Wedding Event', 900, 80000)
          ]
        }
      },
      'indian-wedding-tent-house': {
        title: 'Indian Wedding Tent House Estimator',
        industry: 'Wedding Infrastructure + Event Services',
        subtitle: 'Estimate multi-function wedding setups with tenting, decor, logistics, and peak-season pricing.',
        themeClass: 'theme-indian-tent',
        schema: {
          title: 'Indian Wedding Tent House Quote',
          currencySymbol: ' INR',
          emailButtonText: 'Email Tent House Estimate',
          locale: 'en-IN',
          wizard: true,
          options: cloneCommonOptions(),
          pricing: { taxRate: 18, discountPercent: 0, discountFixed: 0 },
          steps: [
            {
              title: 'Event Profile',
              fields: [
                {
                  type: 'radio-group',
                  name: 'functions',
                  label: 'Primary Function Mix',
                  required: true,
                  options: [
                    { label: 'Wedding + Reception', value: '45000', cost: 'this', checked: true },
                    { label: 'Haldi + Mehendi + Sangeet', value: '62000', cost: 'this' },
                    { label: 'Full 4-Function Package', value: '98000', cost: 'this' }
                  ]
                },
                { type: 'number', name: 'function_days', label: 'Function Days', value: 2, min: 1, max: 6, cost: 'this', mult: 12000, required: true },
                { type: 'number', name: 'guest_count', label: 'Peak Guest Count', value: 300, min: 80, max: 5000, cost: 'this', mult: 180, required: true },
                {
                  type: 'select',
                  name: 'venue_type',
                  label: 'Venue Type',
                  required: true,
                  options: [
                    { label: 'Select venue', value: '', selected: true },
                    { label: 'Banquet Hall', value: 'banquet', cost: '0' },
                    { label: 'Farmhouse Lawn', value: 'farmhouse', cost: '18000' },
                    { label: 'Open Ground', value: 'open-ground', cost: '32000' }
                  ]
                },
                { type: 'number', name: 'combo_discount_calc', label: 'Multi-function Combo Discount', formula: 'max(({function_days}-1)*1500,0)', formulaPrecision: 0, readonly: true, cost: 'this', mult: -1 }
              ]
            },
            {
              title: 'Tent and Decor',
              fields: [
                { type: 'number', name: 'covered_area_sqft', label: 'Covered Tent Area (sq ft)', value: 3500, min: 500, max: 80000, cost: 'this', mult: 38, required: true },
                {
                  type: 'radio-group',
                  name: 'decor_tier',
                  label: 'Decor and Mandap Tier',
                  required: true,
                  options: [
                    { label: 'Standard Theme', value: '28000', cost: 'this', checked: true },
                    { label: 'Royal Floral Theme', value: '62000', cost: 'this' },
                    { label: 'Luxury Designer Theme', value: '125000', cost: 'this' }
                  ]
                },
                {
                  type: 'checkbox-group',
                  name: 'decor_addons',
                  label: 'Decor Add-ons',
                  options: [
                    { label: 'Varmala Stage Design', value: '14000', cost: 'this' },
                    { label: 'Baraat Entry Gate', value: '18000', cost: 'this' },
                    { label: 'Fresh Flower Ceiling', value: '26000', cost: 'this' },
                    { label: 'Photo Booth Zone', value: '9500', cost: 'this' }
                  ]
                },
                { type: 'number', name: 'waterproofing_units', label: 'Weatherproofing Coverage Units', value: 0, min: 0, max: 12, cost: 'this', mult: 3500, showIf: 'venue_type=open-ground' },
                { type: 'number', name: 'mandap_length', label: 'Mandap Front Width (ft)', value: 24, min: 8, max: 80, cost: 'this', mult: 450, required: true }
              ]
            },
            {
              title: 'Logistics and Operations',
              fields: [
                {
                  type: 'radio-group',
                  name: 'lighting_package',
                  label: 'Lighting Setup',
                  required: true,
                  options: [
                    { label: 'Basic Lighting', value: '12000', cost: 'this', checked: true },
                    { label: 'Architectural Lighting', value: '28000', cost: 'this' },
                    { label: 'Premium LED + Pixel Mapping', value: '56000', cost: 'this' }
                  ]
                },
                { type: 'number', name: 'generator_hours', label: 'Generator Backup Hours', value: 8, min: 0, max: 48, cost: 'this', mult: 2200, required: true },
                { type: 'number', name: 'transport_km', label: 'Transport Distance (km)', value: 15, min: 0, max: 500, cost: 'this', mult: 120, required: true },
                {
                  type: 'radio-group',
                  name: 'season_window',
                  label: 'Season Window',
                  required: true,
                  options: [
                    { label: 'Regular Season', value: '0', cost: 'this', checked: true },
                    { label: 'Peak Wedding Season', value: '24000', cost: 'this' },
                    { label: 'Festive Holiday Window', value: '32000', cost: 'this' }
                  ]
                },
                { type: 'number', name: 'late_night_hours', label: 'Late-night Surcharge Hours (after 11 PM)', value: 0, min: 0, max: 10, cost: 'this', mult: 4800, required: true },
                {
                  type: 'checkbox-group',
                  name: 'ops_addons',
                  label: 'Operations Add-ons',
                  options: [
                    { label: 'Housekeeping Crew', value: '12000', cost: 'this' },
                    { label: 'Security Barricading', value: '9000', cost: 'this' },
                    { label: 'Portable Washroom Blocks', value: '22000', cost: 'this' }
                  ]
                }
              ]
            },
            contactStep('Tent House', 50000, 2500000)
          ]
        }
      },
      'beauty-parlor': {
        title: 'Beauty Parlor Service Estimator',
        industry: 'Salon + Bridal Makeup Studio',
        subtitle: 'Estimate salon and makeup bookings by occasion, artist tier, product kit, and travel logistics.',
        themeClass: 'theme-parlor',
        schema: {
          title: 'Beauty Parlor Quote Builder',
          currencySymbol: ' INR',
          emailButtonText: 'Email Beauty Service Quote',
          locale: 'en-IN',
          wizard: true,
          options: cloneCommonOptions(),
          pricing: { taxRate: 18, discountPercent: 0, discountFixed: 0 },
          steps: [
            {
              title: 'Booking Profile',
              fields: [
                {
                  type: 'radio-group',
                  name: 'service_mode',
                  label: 'Service Mode',
                  required: true,
                  options: [
                    { label: 'In-Salon Session', value: '0', cost: 'this', checked: true },
                    { label: 'Home Service Visit', value: '2500', cost: 'this' },
                    { label: 'Bridal Venue Setup', value: '8500', cost: 'this' }
                  ]
                },
                {
                  type: 'select',
                  name: 'occasion',
                  label: 'Occasion',
                  required: true,
                  options: [
                    { label: 'Choose occasion', value: '', selected: true },
                    { label: 'Regular Grooming', value: 'regular', cost: '0' },
                    { label: 'Party Booking', value: 'party', cost: '2500' },
                    { label: 'Festival Ready', value: 'festive', cost: '4200' },
                    { label: 'Bridal Booking', value: 'bridal', cost: '18000' }
                  ]
                },
                { type: 'number', name: 'clients_count', label: 'Clients Covered', value: 1, min: 1, max: 20, cost: 'this', mult: 950, required: true },
                { type: 'number', name: 'appointment_hours', label: 'Appointment Hours', value: 3, min: 1, max: 16, step: 1, required: true },
                {
                  type: 'select',
                  name: 'staff_tier',
                  label: 'Artist Tier',
                  required: true,
                  options: [
                    { label: 'Choose artist tier', value: '', selected: true },
                    { label: 'Standard Artist', value: 'standard', cost: '0' },
                    { label: 'Senior Stylist', value: 'senior', cost: '2800' },
                    { label: 'Signature Artist Team', value: 'signature', cost: '7200' }
                  ]
                },
                { type: 'number', name: 'estimated_artist_hours', label: 'Estimated Artist Hours', formula: 'max(({clients_count}*{appointment_hours})/1.5,2)', formulaPrecision: 1, readonly: true, cost: 'this', mult: 650 }
              ]
            },
            {
              title: 'Services and Add-ons',
              fields: [
                {
                  type: 'radio-group',
                  name: 'service_package',
                  label: 'Primary Package',
                  required: true,
                  options: [
                    { label: 'Salon Essentials', value: '2200', cost: 'this', checked: true },
                    { label: 'Party Glam Package', value: '7800', cost: 'this' },
                    { label: 'Bridal Couture Package', value: '26000', cost: 'this' }
                  ]
                },
                {
                  type: 'checkbox-group',
                  name: 'core_services',
                  label: 'Core Services',
                  options: [
                    { label: 'Hair Styling', value: '1800', cost: 'this' },
                    { label: 'HD Makeup', value: '4200', cost: 'this' },
                    { label: 'Cleanup / Facial Prep', value: '1600', cost: 'this' },
                    { label: 'Saree / Lehenga Draping', value: '1500', cost: 'this' },
                    { label: 'Nail Art', value: '1400', cost: 'this' },
                    { label: 'Hair Extensions', value: '2800', cost: 'this' }
                  ]
                },
                {
                  type: 'radio-group',
                  name: 'product_tier',
                  label: 'Product Kit',
                  required: true,
                  options: [
                    { label: 'Standard Product Kit', value: '0', cost: 'this', checked: true },
                    { label: 'Premium Product Kit', value: '3600', cost: 'this' },
                    { label: 'Luxury Imported Kit', value: '7600', cost: 'this' }
                  ]
                },
                { type: 'number', name: 'group_makeup_count', label: 'Additional Family / Group Makeup Seats', value: 0, min: 0, max: 15, cost: 'this', mult: 3200, showIf: 'occasion=party|occasion=festive|occasion=bridal' },
                { type: 'number', name: 'trial_sessions', label: 'Makeup Trial Sessions', value: 0, min: 0, max: 4, cost: 'this', mult: 3500, showIf: 'occasion=bridal' }
              ]
            },
            {
              title: 'Travel and Timing',
              fields: [
                { type: 'number', name: 'travel_km', label: 'Travel Distance (km)', value: 0, min: 0, max: 200, cost: 'this', mult: 45, showIf: 'service_mode=2500|service_mode=8500' },
                {
                  type: 'radio-group',
                  name: 'booking_slot',
                  label: 'Booking Slot',
                  required: true,
                  options: [
                    { label: 'Standard Day Slot', value: '0', cost: 'this', checked: true },
                    { label: 'Early Morning Slot', value: '1800', cost: 'this' },
                    { label: 'Late Night Slot', value: '2600', cost: 'this' }
                  ]
                },
                {
                  type: 'radio-group',
                  name: 'calendar_window',
                  label: 'Calendar Window',
                  required: true,
                  options: [
                    { label: 'Weekday Booking', value: '0', cost: 'this', checked: true },
                    { label: 'Weekend Booking', value: '1400', cost: 'this' },
                    { label: 'Festival / Peak Window', value: '3200', cost: 'this' }
                  ]
                },
                {
                  type: 'checkbox-group',
                  name: 'ops_addons',
                  label: 'Service Add-ons',
                  options: [
                    { label: 'Touch-up Stayback Team', value: '3800', cost: 'this' },
                    { label: 'Extra Assistant', value: '1200', cost: 'this' },
                    { label: 'Lash / Premium Finishing Kit', value: '1600', cost: 'this' },
                    { label: 'Saree Pinning Desk', value: '900', cost: 'this' }
                  ]
                },
                { type: 'number', name: 'venue_standby_hours', label: 'Venue Standby Hours', value: 0, min: 0, max: 12, cost: 'this', mult: 2200, showIf: 'service_mode=8500' },
                { type: 'number', name: 'group_discount_calc', label: 'Group Booking Discount', formula: 'max(({group_makeup_count}-2)*600,0)', formulaPrecision: 0, readonly: true, cost: 'this', mult: -1, showIf: 'occasion=party|occasion=festive|occasion=bridal' }
              ]
            },
            contactStep('Beauty Service', 1000, 300000)
          ]
        }
      },
      'event-catering': {
        title: 'Event Catering Calculator',
        industry: 'Catering + Hospitality',
        subtitle: 'Estimate food service quotes by guest volume, menu tier, staffing, and production extras.',
        themeClass: 'theme-catering',
        schema: {
          title: 'Catering Quote Planner',
          currencySymbol: ' USD',
          emailButtonText: 'Email Catering Quote',
          locale: 'en-US',
          wizard: true,
          options: cloneCommonOptions(),
          pricing: { taxRate: 6.25, discountPercent: 0, discountFixed: 0 },
          steps: [
            {
              title: 'Menu Scope',
              fields: [
                { type: 'number', name: 'guests', label: 'Guest Count', value: 80, min: 20, max: 1200, cost: 'this', mult: 42, required: true },
                {
                  type: 'radio-group',
                  name: 'service_style',
                  label: 'Service Style',
                  required: true,
                  options: [
                    { label: 'Buffet', value: '600', cost: 'this', checked: true },
                    { label: 'Plated Service', value: '1600', cost: 'this' },
                    { label: 'Tasting Menu', value: '3200', cost: 'this' }
                  ]
                },
                {
                  type: 'select',
                  name: 'menu_tier',
                  label: 'Menu Tier',
                  required: true,
                  options: [
                    { label: 'Choose menu tier', value: '', selected: true },
                    { label: 'Classic', value: 'classic', cost: '0' },
                    { label: 'Signature', value: 'signature', cost: '1400' },
                    { label: 'Chef Table', value: 'chef', cost: '2600' }
                  ]
                },
                { type: 'number', name: 'dessert_station', label: 'Calculated Dessert Station Count', formula: '({guests}/12)+2', formulaPrecision: 0, readonly: true, cost: 'this', mult: 65 }
              ]
            },
            {
              title: 'Staffing and Logistics',
              fields: [
                {
                  type: 'checkbox-group',
                  name: 'event_addons',
                  label: 'Event Add-ons',
                  options: [
                    { label: 'Table Styling', value: '720', cost: 'this' },
                    { label: 'Live Chef Station', value: '950', cost: 'this' },
                    { label: 'Beverage Bar', value: '1200', cost: 'this' },
                    { label: 'Late-night Snacks', value: '640', cost: 'this' }
                  ]
                },
                {
                  type: 'radio-group',
                  name: 'crew_level',
                  label: 'Staffing Level',
                  required: true,
                  options: [
                    { label: 'Standard Crew', value: '0', cost: 'this', checked: true },
                    { label: 'Expanded Crew', value: '850', cost: 'this' },
                    { label: 'Full Service Crew', value: '1500', cost: 'this' }
                  ]
                }
              ]
            },
            contactStep('Catering Project', 1200, 220000)
          ]
        }
      },
      'auto-repair': {
        title: 'Auto Repair Service Quote',
        industry: 'Automotive Garage',
        subtitle: 'Estimate service jobs with labor, diagnostics, parts, and turnaround urgency.',
        themeClass: 'theme-repair',
        schema: {
          title: 'Auto Service Estimate',
          currencySymbol: ' USD',
          emailButtonText: 'Email Repair Estimate',
          locale: 'en-US',
          wizard: true,
          options: cloneCommonOptions(),
          pricing: { taxRate: 8.15, discountPercent: 0, discountFixed: 0 },
          steps: [
            {
              title: 'Vehicle Service Scope',
              fields: [
                {
                  type: 'radio-group',
                  name: 'service_type',
                  label: 'Service Type',
                  required: true,
                  options: [
                    { label: 'Standard Service', value: '260', cost: 'this', checked: true },
                    { label: 'Performance Tune', value: '640', cost: 'this' },
                    { label: 'Major Repair', value: '1900', cost: 'this' }
                  ]
                },
                { type: 'number', name: 'labor_hours', label: 'Labor Hours', value: 3, min: 1, max: 40, cost: 'this', mult: 95, required: true },
                { type: 'number', name: 'parts_budget', label: 'Parts Budget', value: 450, min: 0, max: 20000, cost: 'this', mult: 1, required: true },
                {
                  type: 'checkbox-group',
                  name: 'diagnostics',
                  label: 'Diagnostics',
                  options: [
                    { label: 'Computer Scan', value: '85', cost: 'this' },
                    { label: 'Road Test', value: '60', cost: 'this' },
                    { label: 'Brake Inspection', value: '75', cost: 'this' }
                  ]
                }
              ]
            },
            {
              title: 'Delivery and Warranty',
              fields: [
                {
                  type: 'radio-group',
                  name: 'turnaround',
                  label: 'Turnaround',
                  required: true,
                  options: [
                    { label: '2-day Standard', value: '0', cost: 'this', checked: true },
                    { label: 'Next-day Priority', value: '180', cost: 'this' },
                    { label: 'Same-day Rush', value: '360', cost: 'this' }
                  ]
                },
                {
                  type: 'select',
                  name: 'warranty',
                  label: 'Warranty Extension',
                  required: true,
                  options: [
                    { label: 'Select warranty', value: '', selected: true },
                    { label: '30 Days', value: 'w30', cost: '0' },
                    { label: '6 Months', value: 'w6m', cost: '120' },
                    { label: '12 Months', value: 'w12m', cost: '240' }
                  ]
                }
              ]
            },
            contactStep('Vehicle Service', 200, 45000)
          ]
        }
      },
      'moving-services': {
        title: 'Moving Services Estimator',
        industry: 'Relocation + Logistics',
        subtitle: 'Build household moving quotes with distance, crew size, and specialty handling.',
        themeClass: 'theme-moving',
        schema: {
          title: 'Move Planning Estimate',
          currencySymbol: ' USD',
          emailButtonText: 'Email Move Estimate',
          locale: 'en-US',
          wizard: true,
          options: cloneCommonOptions(),
          pricing: { taxRate: 5.75, discountPercent: 0, discountFixed: 0 },
          steps: [
            {
              title: 'Move Inputs',
              fields: [
                {
                  type: 'radio-group',
                  name: 'property_size',
                  label: 'Property Size',
                  required: true,
                  options: [
                    { label: 'Studio', value: '450', cost: 'this', checked: true },
                    { label: 'Apartment', value: '780', cost: 'this' },
                    { label: 'House', value: '1320', cost: 'this' },
                    { label: 'Large Home', value: '2200', cost: 'this' }
                  ]
                },
                { type: 'number', name: 'distance_miles', label: 'Distance (miles)', value: 20, min: 1, max: 1500, cost: 'this', mult: 2.6, required: true },
                { type: 'number', name: 'truck_count', label: 'Truck Count', value: 1, min: 1, max: 6, cost: 'this', mult: 220, required: true },
                {
                  type: 'checkbox-group',
                  name: 'move_addons',
                  label: 'Optional Handling',
                  options: [
                    { label: 'Packing Service', value: '380', cost: 'this' },
                    { label: 'Piano Handling', value: '260', cost: 'this' },
                    { label: 'Fragile Crate Kit', value: '190', cost: 'this' },
                    { label: 'Appliance Setup', value: '240', cost: 'this' }
                  ]
                }
              ]
            },
            {
              title: 'Schedule and Insurance',
              fields: [
                {
                  type: 'radio-group',
                  name: 'move_day',
                  label: 'Move Day',
                  required: true,
                  options: [
                    { label: 'Weekday', value: '0', cost: 'this', checked: true },
                    { label: 'Weekend', value: '240', cost: 'this' },
                    { label: 'Holiday Window', value: '540', cost: 'this' }
                  ]
                },
                {
                  type: 'select',
                  name: 'insurance_level',
                  label: 'Coverage Level',
                  required: true,
                  options: [
                    { label: 'Select coverage', value: '', selected: true },
                    { label: 'Basic Coverage', value: 'basic', cost: '0' },
                    { label: 'Enhanced Coverage', value: 'enhanced', cost: '160' },
                    { label: 'Premium Coverage', value: 'premium', cost: '320' }
                  ]
                }
              ]
            },
            contactStep('Move', 300, 70000)
          ]
        }
      },
      'dental-clinic': {
        title: 'Dental Treatment Plan Quote',
        industry: 'Healthcare Clinic',
        subtitle: 'Create patient-friendly treatment estimates with diagnostics and payment options.',
        themeClass: 'theme-dental',
        schema: {
          title: 'Dental Plan Estimator',
          currencySymbol: ' USD',
          emailButtonText: 'Email Treatment Plan',
          locale: 'en-US',
          wizard: true,
          options: cloneCommonOptions(),
          pricing: { taxRate: 0, discountPercent: 0, discountFixed: 0 },
          steps: [
            {
              title: 'Treatment Profile',
              fields: [
                {
                  type: 'radio-group',
                  name: 'treatment_type',
                  label: 'Treatment Type',
                  required: true,
                  options: [
                    { label: 'Cleaning', value: '140', cost: 'this', checked: true },
                    { label: 'Whitening', value: '320', cost: 'this' },
                    { label: 'Aligners', value: '2400', cost: 'this' },
                    { label: 'Implant', value: '3800', cost: 'this' }
                  ]
                },
                { type: 'number', name: 'sessions', label: 'Sessions', value: 1, min: 1, max: 24, cost: 'this', mult: 140, required: true },
                {
                  type: 'select',
                  name: 'sedation',
                  label: 'Sedation Level',
                  required: true,
                  options: [
                    { label: 'Select sedation', value: '', selected: true },
                    { label: 'None', value: 'none', cost: '0' },
                    { label: 'Mild Sedation', value: 'mild', cost: '120' },
                    { label: 'Advanced Sedation', value: 'adv', cost: '280' }
                  ]
                },
                {
                  type: 'checkbox-group',
                  name: 'diagnostic_pack',
                  label: 'Diagnostics and Accessories',
                  options: [
                    { label: 'X-ray Set', value: '90', cost: 'this' },
                    { label: '3D Scan', value: '180', cost: 'this' },
                    { label: 'Night Guard', value: '260', cost: 'this' }
                  ]
                }
              ]
            },
            {
              title: 'Payment and Scheduling',
              fields: [
                {
                  type: 'radio-group',
                  name: 'payment_plan',
                  label: 'Payment Plan',
                  required: true,
                  options: [
                    { label: 'One-time Payment', value: '0', cost: 'this', checked: true },
                    { label: '6-Month Plan', value: '180', cost: 'this' },
                    { label: '12-Month Plan', value: '340', cost: 'this' }
                  ]
                },
                {
                  type: 'select',
                  name: 'appointment_priority',
                  label: 'Appointment Priority',
                  required: true,
                  options: [
                    { label: 'Select priority', value: '', selected: true },
                    { label: 'Standard Scheduling', value: 'std', cost: '0' },
                    { label: 'Priority Scheduling', value: 'priority', cost: '65' }
                  ]
                }
              ]
            },
            contactStep('Treatment', 120, 60000)
          ]
        }
      },
      'interior-design': {
        title: 'Interior Design Proposal',
        industry: 'Interior Studio + Consulting',
        subtitle: 'Estimate design proposals using rooms, area, style complexity, and supervision options.',
        themeClass: 'theme-interior',
        schema: {
          title: 'Interior Design Estimate',
          currencySymbol: ' USD',
          emailButtonText: 'Email Design Proposal',
          locale: 'en-US',
          wizard: true,
          options: cloneCommonOptions(),
          pricing: { taxRate: 7.1, discountPercent: 0, discountFixed: 250 },
          steps: [
            {
              title: 'Design Scope',
              fields: [
                {
                  type: 'radio-group',
                  name: 'design_package',
                  label: 'Package',
                  required: true,
                  options: [
                    { label: 'Moodboard Sprint', value: '850', cost: 'this', checked: true },
                    { label: 'Room-by-Room Design', value: '2200', cost: 'this' },
                    { label: 'Full Home Design', value: '6900', cost: 'this' }
                  ]
                },
                { type: 'number', name: 'rooms', label: 'Rooms Included', value: 2, min: 1, max: 25, cost: 'this', mult: 680, required: true },
                { type: 'number', name: 'area_sqft', label: 'Design Area (sq ft)', value: 1200, min: 150, max: 20000, cost: 'this', mult: 3.4, required: true },
                {
                  type: 'select',
                  name: 'complexity',
                  label: 'Style Complexity',
                  required: true,
                  options: [
                    { label: 'Select complexity', value: '', selected: true },
                    { label: 'Minimal', value: 'minimal', cost: '0' },
                    { label: 'Layered', value: 'layered', cost: '1200' },
                    { label: 'Luxury', value: 'luxury', cost: '2800' }
                  ]
                },
                { type: 'number', name: 'revision_rounds', label: 'Estimated Revision Rounds', formula: '({rooms}/2)+1', formulaPrecision: 0, readonly: true, cost: 'this', mult: 320 }
              ]
            },
            {
              title: 'Execution Add-ons',
              fields: [
                {
                  type: 'checkbox-group',
                  name: 'design_addons',
                  label: 'Add-ons',
                  options: [
                    { label: '3D Rendering Set', value: '950', cost: 'this' },
                    { label: 'Procurement and Sourcing', value: '1200', cost: 'this' },
                    { label: 'Site Supervision', value: '1600', cost: 'this' },
                    { label: 'Custom Furniture Plan', value: '2100', cost: 'this' }
                  ]
                },
                {
                  type: 'radio-group',
                  name: 'timeline',
                  label: 'Delivery Timeline',
                  required: true,
                  options: [
                    { label: 'Standard', value: '0', cost: 'this', checked: true },
                    { label: 'Accelerated Delivery', value: '950', cost: 'this' }
                  ]
                }
              ]
            },
            contactStep('Design', 1200, 300000)
          ]
        }
      },
      'landscaping': {
        title: 'Landscaping Project Estimator',
        industry: 'Outdoor + Home Improvement',
        subtitle: 'Quote outdoor upgrades by yard area, feature packages, and install window.',
        themeClass: 'theme-landscape',
        schema: {
          title: 'Outdoor Upgrade Estimator',
          currencySymbol: ' USD',
          emailButtonText: 'Email Landscaping Quote',
          locale: 'en-US',
          wizard: true,
          options: cloneCommonOptions(),
          pricing: { taxRate: 6.9, discountPercent: 0, discountFixed: 0 },
          steps: [
            {
              title: 'Yard Scope',
              fields: [
                {
                  type: 'radio-group',
                  name: 'project_scope',
                  label: 'Project Scope',
                  required: true,
                  options: [
                    { label: 'Lawn Refresh', value: '900', cost: 'this', checked: true },
                    { label: 'Backyard Makeover', value: '2600', cost: 'this' },
                    { label: 'Full Outdoor Redesign', value: '6400', cost: 'this' }
                  ]
                },
                { type: 'number', name: 'yard_area', label: 'Yard Area (sq ft)', value: 1800, min: 200, max: 60000, cost: 'this', mult: 1.8, required: true },
                {
                  type: 'checkbox-group',
                  name: 'features',
                  label: 'Feature Add-ons',
                  options: [
                    { label: 'Irrigation System', value: '900', cost: 'this' },
                    { label: 'Outdoor Lighting', value: '1200', cost: 'this' },
                    { label: 'Deck Build', value: '2800', cost: 'this' },
                    { label: 'Firepit Installation', value: '2200', cost: 'this' }
                  ]
                },
                { type: 'number', name: 'maintenance_months', label: 'Post-project Maintenance (months)', value: 3, min: 0, max: 24, cost: 'this', mult: 180, required: true }
              ]
            },
            {
              title: 'Schedule and Warranty',
              fields: [
                {
                  type: 'radio-group',
                  name: 'season_window',
                  label: 'Install Window',
                  required: true,
                  options: [
                    { label: 'Regular Season', value: '0', cost: 'this', checked: true },
                    { label: 'Peak Season', value: '680', cost: 'this' },
                    { label: 'Holiday Install Window', value: '980', cost: 'this' }
                  ]
                },
                {
                  type: 'select',
                  name: 'warranty',
                  label: 'Warranty Plan',
                  required: true,
                  options: [
                    { label: 'Select warranty', value: '', selected: true },
                    { label: 'No Warranty', value: 'none', cost: '0' },
                    { label: '1-Year Warranty', value: 'w1', cost: '220' },
                    { label: '3-Year Warranty', value: 'w3', cost: '580' }
                  ]
                }
              ]
            },
            contactStep('Landscape', 800, 250000)
          ]
        }
      }
    };
  }

  function buildScenarioBannerSvg(slug) {
    var specs = {
      'computer-assembly': {
        colors: ['#10223e', '#165c92', '#86dcff'],
        glow: '#c4f2ff',
        art: [
          '<rect x="136" y="134" width="318" height="188" rx="18" fill="#0f2141" fill-opacity="0.24" stroke="#ffffff" stroke-opacity="0.34" stroke-width="2"/>',
          '<rect x="174" y="170" width="244" height="112" rx="14" fill="#c8efff" fill-opacity="0.18" stroke="#ffffff" stroke-opacity="0.38" stroke-width="2"/>',
          '<rect x="244" y="292" width="104" height="14" rx="7" fill="#e7f8ff" fill-opacity="0.76"/>',
          '<rect x="502" y="126" width="140" height="224" rx="22" fill="#0b1c36" fill-opacity="0.28" stroke="#ffffff" stroke-opacity="0.34" stroke-width="2"/>',
          '<circle cx="572" cy="170" r="18" fill="#93f0ff" fill-opacity="0.9"/>',
          '<rect x="538" y="212" width="68" height="12" rx="6" fill="#dff8ff" fill-opacity="0.7"/>',
          '<rect x="528" y="244" width="88" height="44" rx="12" fill="#ffffff" fill-opacity="0.12" stroke="#ffffff" stroke-opacity="0.3"/>',
          '<path d="M674 176H758L804 126" stroke="#d4f7ff" stroke-opacity="0.8" stroke-width="10" stroke-linecap="round"/>',
          '<path d="M674 296H766L812 344" stroke="#d4f7ff" stroke-opacity="0.7" stroke-width="10" stroke-linecap="round"/>'
        ].join('')
      },
      'web-development': {
        colors: ['#1a2452', '#2f63ff', '#79e6ff'],
        glow: '#c9d7ff',
        art: [
          '<rect x="132" y="122" width="520" height="266" rx="24" fill="#0f1b45" fill-opacity="0.24" stroke="#ffffff" stroke-opacity="0.34" stroke-width="2"/>',
          '<rect x="132" y="122" width="520" height="58" rx="24" fill="#ffffff" fill-opacity="0.14"/>',
          '<circle cx="182" cy="151" r="10" fill="#ffffff" fill-opacity="0.76"/>',
          '<circle cx="216" cy="151" r="10" fill="#ffffff" fill-opacity="0.46"/>',
          '<circle cx="250" cy="151" r="10" fill="#ffffff" fill-opacity="0.3"/>',
          '<path d="M260 238L210 286L260 334" stroke="#ffffff" stroke-opacity="0.8" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"/>',
          '<path d="M526 238L576 286L526 334" stroke="#9ef0ff" stroke-opacity="0.85" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"/>',
          '<path d="M398 224L350 348" stroke="#d7f8ff" stroke-opacity="0.8" stroke-width="16" stroke-linecap="round"/>',
          '<rect x="676" y="184" width="154" height="24" rx="12" fill="#ffffff" fill-opacity="0.26"/>',
          '<rect x="676" y="236" width="224" height="20" rx="10" fill="#ffffff" fill-opacity="0.18"/>',
          '<rect x="676" y="280" width="188" height="20" rx="10" fill="#ffffff" fill-opacity="0.18"/>',
          '<rect x="676" y="324" width="134" height="20" rx="10" fill="#ffffff" fill-opacity="0.18"/>'
        ].join('')
      },
      'solar-installation': {
        colors: ['#0d5c4a', '#16956d', '#f5d55f'],
        glow: '#fff2b4',
        art: [
          '<circle cx="724" cy="148" r="52" fill="#ffe27f" fill-opacity="0.96"/>',
          '<path d="M178 312L328 198L478 312V370H178Z" fill="#163d33" fill-opacity="0.34" stroke="#ffffff" stroke-opacity="0.34" stroke-width="2"/>',
          '<path d="M150 312H506" stroke="#ffffff" stroke-opacity="0.54" stroke-width="10" stroke-linecap="round"/>',
          '<rect x="258" y="240" width="132" height="62" rx="10" fill="#0b3244" fill-opacity="0.66" stroke="#9ff1d5" stroke-opacity="0.84" stroke-width="2"/>',
          '<line x1="302" y1="240" x2="302" y2="302" stroke="#9ff1d5" stroke-opacity="0.86"/>',
          '<line x1="346" y1="240" x2="346" y2="302" stroke="#9ff1d5" stroke-opacity="0.86"/>',
          '<line x1="258" y1="261" x2="390" y2="261" stroke="#9ff1d5" stroke-opacity="0.86"/>',
          '<line x1="258" y1="282" x2="390" y2="282" stroke="#9ff1d5" stroke-opacity="0.86"/>',
          '<rect x="540" y="258" width="112" height="74" rx="16" fill="#ffffff" fill-opacity="0.14" stroke="#ffffff" stroke-opacity="0.32" stroke-width="2"/>',
          '<path d="M596 238V258" stroke="#ffffff" stroke-opacity="0.7" stroke-width="10" stroke-linecap="round"/>',
          '<path d="M566 332H626" stroke="#ffffff" stroke-opacity="0.7" stroke-width="10" stroke-linecap="round"/>'
        ].join('')
      },
      'wedding-photography': {
        colors: ['#5a274b', '#af4f8d', '#ffd3b9'],
        glow: '#ffe4d8',
        art: [
          '<rect x="146" y="176" width="268" height="160" rx="34" fill="#ffffff" fill-opacity="0.18" stroke="#ffffff" stroke-opacity="0.38" stroke-width="2"/>',
          '<circle cx="280" cy="256" r="52" fill="none" stroke="#ffffff" stroke-opacity="0.9" stroke-width="16"/>',
          '<circle cx="280" cy="256" r="18" fill="#ffe6f2" fill-opacity="0.92"/>',
          '<rect x="202" y="146" width="76" height="34" rx="12" fill="#ffffff" fill-opacity="0.24"/>',
          '<rect x="470" y="154" width="252" height="214" rx="26" fill="#ffffff" fill-opacity="0.1" stroke="#ffffff" stroke-opacity="0.3" stroke-width="2"/>',
          '<path d="M546 316C580 272 612 248 648 244C684 248 716 272 750 316" stroke="#ffe8f5" stroke-opacity="0.9" stroke-width="12" stroke-linecap="round"/>',
          '<circle cx="602" cy="212" r="24" fill="#ffe6d9" fill-opacity="0.96"/>',
          '<circle cx="694" cy="212" r="24" fill="#ffe6d9" fill-opacity="0.96"/>',
          '<path d="M590 178C590 154 614 138 640 138C668 138 690 156 690 182C690 220 656 236 640 258C624 236 590 220 590 178Z" fill="#ffd4e5" fill-opacity="0.86"/>'
        ].join('')
      },
      'indian-wedding-tent-house': {
        colors: ['#5b2c17', '#cf7a22', '#ffe49c'],
        glow: '#fff1c6',
        art: [
          '<path d="M150 300L294 146L438 300" fill="none" stroke="#ffffff" stroke-opacity="0.82" stroke-width="18" stroke-linecap="round" stroke-linejoin="round"/>',
          '<path d="M462 300L606 146L750 300" fill="none" stroke="#ffffff" stroke-opacity="0.82" stroke-width="18" stroke-linecap="round" stroke-linejoin="round"/>',
          '<path d="M150 300H750" stroke="#ffffff" stroke-opacity="0.85" stroke-width="18" stroke-linecap="round"/>',
          '<path d="M180 324H720" stroke="#fff1d4" stroke-opacity="0.7" stroke-width="8" stroke-linecap="round"/>',
          '<circle cx="208" cy="222" r="10" fill="#ffe890"/>',
          '<circle cx="294" cy="196" r="10" fill="#ffe890"/>',
          '<circle cx="380" cy="222" r="10" fill="#ffe890"/>',
          '<circle cx="518" cy="222" r="10" fill="#ffe890"/>',
          '<circle cx="606" cy="196" r="10" fill="#ffe890"/>',
          '<circle cx="692" cy="222" r="10" fill="#ffe890"/>',
          '<rect x="322" y="300" width="256" height="76" rx="18" fill="#ffffff" fill-opacity="0.14" stroke="#ffffff" stroke-opacity="0.3" stroke-width="2"/>',
          '<path d="M382 300V376M518 300V376" stroke="#ffffff" stroke-opacity="0.5" stroke-width="8"/>'
        ].join('')
      },
      'beauty-parlor': {
        colors: ['#6a2933', '#d56d55', '#ffd9c2'],
        glow: '#ffe7d6',
        art: [
          '<ellipse cx="286" cy="246" rx="120" ry="146" fill="#ffffff" fill-opacity="0.12" stroke="#ffffff" stroke-opacity="0.42" stroke-width="10"/>',
          '<ellipse cx="286" cy="246" rx="88" ry="114" fill="none" stroke="#ffe7dd" stroke-opacity="0.86" stroke-width="8"/>',
          '<rect x="246" y="376" width="80" height="20" rx="10" fill="#fff0ea" fill-opacity="0.8"/>',
          '<rect x="510" y="178" width="38" height="154" rx="18" fill="#ffb59c" fill-opacity="0.92"/>',
          '<rect x="506" y="146" width="46" height="46" rx="10" fill="#ffe3db" fill-opacity="0.92"/>',
          '<path d="M642 162L704 224L672 256L610 194Z" fill="#fff1ea" fill-opacity="0.9"/>',
          '<path d="M622 144L646 120L728 202L704 226Z" fill="#ffe0d4" fill-opacity="0.86"/>',
          '<circle cx="686" cy="154" r="18" fill="#ffd4c4" fill-opacity="0.88"/>',
          '<rect x="602" y="302" width="132" height="28" rx="14" fill="#ffffff" fill-opacity="0.16"/>'
        ].join('')
      },
      'event-catering': {
        colors: ['#5d3512', '#c87424', '#ffe7b6'],
        glow: '#fff0cb',
        art: [
          '<ellipse cx="306" cy="320" rx="168" ry="42" fill="#fff5e0" fill-opacity="0.86"/>',
          '<path d="M168 298C190 218 246 176 306 176C366 176 422 218 444 298Z" fill="#ffffff" fill-opacity="0.14" stroke="#ffffff" stroke-opacity="0.4" stroke-width="8"/>',
          '<path d="M222 298C236 242 270 214 306 214C342 214 376 242 390 298Z" fill="none" stroke="#fff2d4" stroke-opacity="0.84" stroke-width="10"/>',
          '<path d="M514 204H556V344H514" stroke="#ffffff" stroke-opacity="0.7" stroke-width="12" stroke-linecap="round"/>',
          '<path d="M628 204H670V344H628" stroke="#ffffff" stroke-opacity="0.7" stroke-width="12" stroke-linecap="round"/>',
          '<rect x="546" y="214" width="46" height="112" rx="16" fill="#fff4de" fill-opacity="0.82"/>',
          '<rect x="660" y="214" width="46" height="112" rx="16" fill="#fff4de" fill-opacity="0.82"/>'
        ].join('')
      },
      'auto-repair': {
        colors: ['#2b303f', '#5a657c', '#9ed8ff'],
        glow: '#cfe7ff',
        art: [
          '<path d="M168 288L232 216H422L486 288V336H168Z" fill="#ffffff" fill-opacity="0.14" stroke="#ffffff" stroke-opacity="0.38" stroke-width="2"/>',
          '<circle cx="238" cy="336" r="34" fill="#d8e8ff" fill-opacity="0.82"/>',
          '<circle cx="416" cy="336" r="34" fill="#d8e8ff" fill-opacity="0.82"/>',
          '<circle cx="238" cy="336" r="16" fill="#41506b"/>',
          '<circle cx="416" cy="336" r="16" fill="#41506b"/>',
          '<circle cx="664" cy="242" r="76" fill="none" stroke="#ffffff" stroke-opacity="0.5" stroke-width="18"/>',
          '<circle cx="664" cy="242" r="24" fill="#d8e8ff" fill-opacity="0.84"/>',
          '<path d="M664 134V170M664 314V350M556 242H592M736 242H772M588 166L614 192M714 292L740 318M588 318L614 292M714 192L740 166" stroke="#d8e8ff" stroke-opacity="0.78" stroke-width="12" stroke-linecap="round"/>'
        ].join('')
      },
      'moving-services': {
        colors: ['#113a62', '#0f7ab8', '#d4f5ff'],
        glow: '#d6efff',
        art: [
          '<rect x="146" y="196" width="142" height="142" rx="18" fill="#ffffff" fill-opacity="0.14" stroke="#ffffff" stroke-opacity="0.34" stroke-width="2"/>',
          '<path d="M146 196L218 148L288 196" fill="none" stroke="#ffffff" stroke-opacity="0.44" stroke-width="8"/>',
          '<rect x="316" y="174" width="168" height="164" rx="18" fill="#ffffff" fill-opacity="0.12" stroke="#ffffff" stroke-opacity="0.34" stroke-width="2"/>',
          '<path d="M316 174L400 126L484 174" fill="none" stroke="#ffffff" stroke-opacity="0.44" stroke-width="8"/>',
          '<rect x="566" y="238" width="168" height="78" rx="18" fill="#ffffff" fill-opacity="0.16" stroke="#ffffff" stroke-opacity="0.38" stroke-width="2"/>',
          '<rect x="706" y="202" width="92" height="114" rx="18" fill="#ffffff" fill-opacity="0.12" stroke="#ffffff" stroke-opacity="0.32" stroke-width="2"/>',
          '<circle cx="618" cy="336" r="24" fill="#d8f1ff" fill-opacity="0.88"/>',
          '<circle cx="742" cy="336" r="24" fill="#d8f1ff" fill-opacity="0.88"/>',
          '<circle cx="618" cy="336" r="10" fill="#184a70"/>',
          '<circle cx="742" cy="336" r="10" fill="#184a70"/>'
        ].join('')
      },
      'dental-clinic': {
        colors: ['#0b5d72', '#10a2c1', '#d6fbf0'],
        glow: '#d8f6ff',
        art: [
          '<path d="M260 142C328 142 378 188 378 262C378 322 344 384 298 384C266 384 250 356 228 356C206 356 192 384 160 384C114 384 80 322 80 262C80 188 128 142 196 142C218 142 232 152 260 152C288 152 238 142 260 142Z" fill="#ffffff" fill-opacity="0.18" stroke="#ffffff" stroke-opacity="0.42" stroke-width="2"/>',
          '<path d="M260 142C328 142 378 188 378 262C378 322 344 384 298 384C266 384 250 356 228 356C206 356 192 384 160 384C114 384 80 322 80 262C80 188 128 142 196 142C218 142 232 152 260 152C288 152 238 142 260 142Z" fill="none" stroke="#d8f9ff" stroke-opacity="0.72" stroke-width="10"/>',
          '<path d="M614 168V314M542 242H686" stroke="#ffffff" stroke-opacity="0.84" stroke-width="18" stroke-linecap="round"/>',
          '<circle cx="614" cy="242" r="104" fill="none" stroke="#ffffff" stroke-opacity="0.3" stroke-width="10"/>',
          '<path d="M760 168L788 196M760 308L788 280" stroke="#d8f8ff" stroke-opacity="0.86" stroke-width="10" stroke-linecap="round"/>'
        ].join('')
      },
      'interior-design': {
        colors: ['#553921', '#9d7041', '#f7eadc'],
        glow: '#fff2e3',
        art: [
          '<rect x="154" y="264" width="244" height="84" rx="24" fill="#ffffff" fill-opacity="0.16" stroke="#ffffff" stroke-opacity="0.38" stroke-width="2"/>',
          '<rect x="196" y="206" width="160" height="82" rx="22" fill="#ffffff" fill-opacity="0.12" stroke="#ffffff" stroke-opacity="0.34" stroke-width="2"/>',
          '<path d="M196 348L178 392M356 348L374 392" stroke="#fff2e1" stroke-opacity="0.8" stroke-width="10" stroke-linecap="round"/>',
          '<path d="M514 188H578V348H514" stroke="#ffffff" stroke-opacity="0.76" stroke-width="12" stroke-linecap="round"/>',
          '<path d="M560 188V150" stroke="#ffffff" stroke-opacity="0.76" stroke-width="10" stroke-linecap="round"/>',
          '<circle cx="560" cy="144" r="26" fill="#fff3e6" fill-opacity="0.9"/>',
          '<rect x="646" y="170" width="170" height="138" rx="18" fill="#ffffff" fill-opacity="0.12" stroke="#ffffff" stroke-opacity="0.32" stroke-width="2"/>',
          '<rect x="670" y="194" width="58" height="38" rx="10" fill="#fff4ea" fill-opacity="0.84"/>',
          '<rect x="742" y="194" width="48" height="92" rx="10" fill="#ffffff" fill-opacity="0.18"/>'
        ].join('')
      },
      'landscaping': {
        colors: ['#19472a', '#2f8f45', '#dbf6b7'],
        glow: '#e4ffd0',
        art: [
          '<path d="M180 356C180 272 240 212 316 212C392 212 452 272 452 356" fill="#ffffff" fill-opacity="0.14" stroke="#ffffff" stroke-opacity="0.34" stroke-width="2"/>',
          '<path d="M254 356C254 288 286 244 316 212C346 244 378 288 378 356" fill="#dffbd2" fill-opacity="0.46"/>',
          '<path d="M564 352L626 170L688 352" fill="none" stroke="#ffffff" stroke-opacity="0.74" stroke-width="14" stroke-linecap="round" stroke-linejoin="round"/>',
          '<path d="M626 170V132" stroke="#ffffff" stroke-opacity="0.74" stroke-width="10" stroke-linecap="round"/>',
          '<path d="M742 282C772 248 810 248 840 282" fill="none" stroke="#ffffff" stroke-opacity="0.78" stroke-width="10" stroke-linecap="round"/>',
          '<path d="M770 298C790 268 820 268 840 298" fill="none" stroke="#dffbd2" stroke-opacity="0.9" stroke-width="8" stroke-linecap="round"/>',
          '<circle cx="770" cy="306" r="8" fill="#ffffff" fill-opacity="0.86"/>',
          '<circle cx="794" cy="322" r="8" fill="#ffffff" fill-opacity="0.76"/>',
          '<circle cx="822" cy="314" r="8" fill="#ffffff" fill-opacity="0.86"/>'
        ].join('')
      }
    };
    var spec = specs[slug] || specs['computer-assembly'];

    return [
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 420" role="img" aria-hidden="true">',
      '<defs>',
      '<linearGradient id="banner-bg" x1="0%" y1="0%" x2="100%" y2="100%">',
      '<stop offset="0%" stop-color="', spec.colors[0], '"/>',
      '<stop offset="58%" stop-color="', spec.colors[1], '"/>',
      '<stop offset="100%" stop-color="', spec.colors[2], '"/>',
      '</linearGradient>',
      '<radialGradient id="banner-glow" cx="75%" cy="22%" r="60%">',
      '<stop offset="0%" stop-color="', spec.glow, '" stop-opacity="0.72"/>',
      '<stop offset="100%" stop-color="', spec.glow, '" stop-opacity="0"/>',
      '</radialGradient>',
      '</defs>',
      '<rect width="960" height="420" fill="url(#banner-bg)"/>',
      '<rect x="22" y="22" width="916" height="376" rx="24" fill="#ffffff" fill-opacity="0.06" stroke="#ffffff" stroke-opacity="0.18" stroke-width="2"/>',
      '<circle cx="768" cy="108" r="180" fill="url(#banner-glow)"/>',
      '<circle cx="160" cy="360" r="120" fill="#ffffff" fill-opacity="0.06"/>',
      '<path d="M0 346C126 314 212 330 302 346C394 362 478 390 594 360C690 334 802 264 960 290V420H0Z" fill="#08152f" fill-opacity="0.18"/>',
      '<g fill="none" stroke-linecap="round" stroke-linejoin="round">', spec.art, '</g>',
      '</svg>'
    ].join('');
  }

  function setScenarioBanner(slug, title) {
    $('#scenario-banner')
      .attr('src', 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(buildScenarioBannerSvg(slug)))
      .attr('alt', title + ' banner illustration');
  }

  function formatMoney(value, locale, currency) {
    var num = Number(value || 0);
    if (isNaN(num)) {
      num = 0;
    }
    return num.toLocaleString(locale || 'en-US', { style: 'currency', currency: currency || 'USD' });
  }

  function inferCurrencyCode(schema) {
    var locale = String((schema && schema.locale) || '');
    var symbol = String((schema && schema.currencySymbol) || '').toUpperCase();
    var explicitCode = String((schema && schema.currencyCode) || '').toUpperCase();

    if (explicitCode) {
      return explicitCode;
    }
    if (symbol.indexOf('INR') !== -1 || symbol.indexOf('₹') !== -1 || locale === 'en-IN') {
      return 'INR';
    }
    return 'USD';
  }

  function initScenarioDemo() {
    var scenarioCatalog = buildCatalog();
    var scenarioKeys = Object.keys(scenarioCatalog);
    var themeClasses = [];
    var i;
    for (i = 0; i < scenarioKeys.length; i++) {
      themeClasses.push(scenarioCatalog[scenarioKeys[i]].themeClass);
    }

    function setMetaText(text) {
      $('#scenario-meta').text(text || 'Live summary ready');
    }

    function fillPicker(activeKey) {
      var $picker = $('#scenario-picker');
      $picker.empty();
      for (var k = 0; k < scenarioKeys.length; k++) {
        var key = scenarioKeys[k];
        var label = scenarioCatalog[key].title;
        var selected = key === activeKey ? ' selected="selected"' : '';
        $picker.append('<option value="' + $('<div>').text(key).html() + '"' + selected + '>' + $('<div>').text(label).html() + '</option>');
      }
    }

    function applyTheme(themeClass) {
      $('body').removeClass(themeClasses.join(' '));
      $('body').addClass(themeClass);
    }

    function renderScenario(key) {
      var active = scenarioCatalog[key] ? key : scenarioKeys[0];
      var data = scenarioCatalog[active];
      var schema = $.extend(true, {}, data.schema);
      var moneyLocale = schema.locale || 'en-US';
      var moneyCurrency = inferCurrencyCode(schema);

      applyTheme(data.themeClass);
      $('#scenario-industry').text(data.industry);
      $('#scenario-title').text(data.title);
      $('#scenario-subtitle').text(data.subtitle);
      setScenarioBanner(active, data.title);
      document.title = 'PCC Demo - ' + data.title;

      schema.id = 'pcc-' + active;
      schema.summaryId = schema.id + '-show';

      var result = $.pcc.renderSchema('#scenario-form-root', schema, {
        skipRestore: true,
        restoreDraftPrompt: false,
        autosave: true
      });

      if (!result.ok) {
        $('#scenario-form-root').html('<div class="demo-error">Schema render failed: ' + $('<div>').text((result.errors || []).join(' | ') || result.message || 'Unknown error').html() + '</div>');
        setMetaText('Schema render failed');
        return;
      }

      var $form = $('#' + schema.id);
      $form.pcc({
        hooks: {
          afterCalc: function (payload) {
            var total = payload && payload.finalTotal != null ? payload.finalTotal : 0;
            setMetaText('Live estimate: ' + formatMoney(total, moneyLocale, moneyCurrency));
          }
        }
      });

      var summaryText = $('#' + schema.id + '-show .pcc-total').text();
      if (summaryText) {
        setMetaText(summaryText);
      } else {
        setMetaText('Live summary ready');
      }
      $('#scenario-picker').val(active);
    }

    var requested = String(window.pccRequestedScenario || '');
    if (!scenarioCatalog[requested]) {
      requested = scenarioKeys[0];
    }

    fillPicker(requested);
    renderScenario(requested);

    $('#scenario-picker').on('change', function () {
      var nextKey = String($(this).val() || '');
      if (!scenarioCatalog[nextKey]) {
        return;
      }
      renderScenario(nextKey);
      var nextUrl = new URL(window.location.href);
      nextUrl.searchParams.set('scenario', nextKey);
      window.history.replaceState({}, '', nextUrl.toString());
    });
  }

  $(initScenarioDemo);
})(jQuery);
