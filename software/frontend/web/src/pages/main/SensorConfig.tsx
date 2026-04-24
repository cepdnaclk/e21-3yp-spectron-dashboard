import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Grid,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Alert,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import { ArrowBack, AutoAwesome, BatteryChargingFull, Tune } from '@mui/icons-material';
import {
  getSensor,
  Sensor,
  getAISuggestedConfig,
  saveSensorConfig,
  SensorConfig as SensorConfigPayload,
  AISuggestRequest,
  SensorContext,
} from '../../services/sensorService';
import { estimateBatteryLifeDays, getSensorMetrics } from '../../utils/sensorConfig';
import { SensorConfigSkeleton } from '../../components/LoadingSkeletons';

type MetricThresholdInput = {
  mode: ThresholdMode;
  min: string;
  max: string;
  warningMin: string;
  warningMax: string;
};

type MetricThresholdPayload = {
  min?: number;
  max?: number;
  warning_min?: number;
  warning_max?: number;
};

type SetupMode = 'manual' | 'ai_assisted';
type ThresholdMode = 'min' | 'max' | 'range';
type SensorConfigNavigationState = {
  preferredSetupMode?: SetupMode;
  returnTo?: string;
};

type AiDraftSummary = {
  explanation: string;
  warnings: string[];
  confidenceScore: number;
  requiresUserConfirmation: boolean;
};

const toNumberOrUndefined = (value: string): number | undefined => {
  if (!value || value.trim() === '') {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const emptyMetricThresholdInput = (): MetricThresholdInput => ({
  mode: 'range',
  min: '',
  max: '',
  warningMin: '',
  warningMax: '',
});

const inferThresholdMode = (thresholds?: Partial<MetricThresholdPayload>): ThresholdMode => {
  const hasMin = thresholds?.min !== undefined;
  const hasMax = thresholds?.max !== undefined;

  if (hasMin && !hasMax) {
    return 'min';
  }
  if (!hasMin && hasMax) {
    return 'max';
  }
  return 'range';
};

const applyThresholdMode = (
  current: MetricThresholdInput,
  mode: ThresholdMode
): MetricThresholdInput => {
  if (mode === 'min') {
    return {
      ...current,
      mode,
      max: '',
      warningMax: '',
    };
  }

  if (mode === 'max') {
    return {
      ...current,
      mode,
      min: '',
      warningMin: '',
    };
  }

  return {
    ...current,
    mode,
  };
};

const toPositiveIntOrUndefined = (value: string): number | undefined => {
  if (!value || value.trim() === '') {
    return undefined;
  }

  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return undefined;
  }

  return Math.round(parsed);
};

const SensorConfig: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const navigationState = (location.state || null) as SensorConfigNavigationState | null;
  const [sensor, setSensor] = useState<Sensor | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  const [setupMode, setSetupMode] = useState<SetupMode>('manual');
  const [purpose, setPurpose] = useState('');
  const [domain, setDomain] = useState('');
  const [environmentType, setEnvironmentType] = useState('');
  const [indoorOutdoor, setIndoorOutdoor] = useState('');
  const [assetType, setAssetType] = useState('');
  const [locationCountry, setLocationCountry] = useState('');
  const [locationRegion, setLocationRegion] = useState('');
  const [locationLabel, setLocationLabel] = useState('');
  const [historicalWindowDays, setHistoricalWindowDays] = useState('14');
  const [installationNotes, setInstallationNotes] = useState('');
  const [friendlyName, setFriendlyName] = useState('');
  const [metricThresholds, setMetricThresholds] = useState<Record<string, MetricThresholdInput>>({});
  const [reportsPerDay, setReportsPerDay] = useState('24');
  const [readingFlowType, setReadingFlowType] = useState<'CONSTANT_PER_DAY' | 'TRIGGER'>('CONSTANT_PER_DAY');
  const [validationStatus, setValidationStatus] = useState('');
  const [validationWarnings, setValidationWarnings] = useState<string[]>([]);
  const [pageError, setPageError] = useState<string | null>(null);
  const [aiDraftSummary, setAiDraftSummary] = useState<AiDraftSummary | null>(null);
  const initializedSensorIdRef = useRef<string | null>(null);

  const sensorMetrics = useMemo(() => getSensorMetrics(sensor?.type || ''), [sensor?.type]);
  const isAiAssisted = setupMode === 'ai_assisted';
  const estimatedBatteryLifeDays = estimateBatteryLifeDays(
    parseInt(reportsPerDay, 10) || 1,
    sensorMetrics.length,
    readingFlowType
  );

  const handleBack = () => {
    if ((window.history.state?.idx ?? 0) > 0) {
      navigate(-1);
      return;
    }

    if (sensor?.controller_id) {
      navigate(`/controllers/${sensor.controller_id}`);
      return;
    }

    navigate('/controllers');
  };

  useEffect(() => {
    if (sensorMetrics.length === 0) return;

    setMetricThresholds((current) => {
      const next: Record<string, MetricThresholdInput> = {};
      for (const metric of sensorMetrics) {
        next[metric.key] = current[metric.key] || emptyMetricThresholdInput();
      }
      return next;
    });
  }, [sensorMetrics]);

  const loadSensor = useCallback(async () => {
    if (!id) return;

    try {
      setPageError(null);
      const sensorData = await getSensor(id);
      setSensor(sensorData);

      if (initializedSensorIdRef.current !== id) {
        setPurpose(sensorData.purpose || '');
        setFriendlyName(sensorData.active_config?.friendly_name || sensorData.name || '');
        setDomain(sensorData.context?.domain || '');
        setEnvironmentType(sensorData.context?.environment_type || '');
        setIndoorOutdoor(sensorData.context?.indoor_outdoor || '');
        setAssetType(sensorData.context?.asset_type || '');
        setLocationCountry(sensorData.context?.location?.country || '');
        setLocationRegion(sensorData.context?.location?.region || '');
        setLocationLabel(sensorData.context?.location?.label || '');
        setHistoricalWindowDays(sensorData.context?.historical_window_days?.toString() || '14');
        setInstallationNotes(sensorData.context?.installation_notes || '');
        setReportsPerDay(sensorData.active_config?.report_interval_per_day?.toString() || '24');

        const nextMetricThresholds: Record<string, MetricThresholdInput> = {};
        const metrics = getSensorMetrics(sensorData.type || '');
        for (const metric of metrics) {
          const metricConfig =
            sensorData.active_config?.metric_thresholds?.[metric.key] ||
            (metrics.length === 1 ? sensorData.active_config?.thresholds : undefined);

          nextMetricThresholds[metric.key] = {
            mode: inferThresholdMode(metricConfig),
            min: metricConfig?.min?.toString() || '',
            max: metricConfig?.max?.toString() || '',
            warningMin: metricConfig?.warning_min?.toString() || '',
            warningMax: metricConfig?.warning_max?.toString() || '',
          };
        }
        if (metrics.length > 0) {
          setMetricThresholds(nextMetricThresholds);
        }

        setSetupMode(navigationState?.preferredSetupMode || (sensorData.purpose ? 'ai_assisted' : 'manual'));
        initializedSensorIdRef.current = id;
      }
    } catch (error) {
      console.error('Error loading sensor:', error);
      setPageError('Failed to load sensor data.');
    } finally {
      setLoading(false);
    }
  }, [id, navigationState?.preferredSetupMode]);

  useEffect(() => {
    initializedSensorIdRef.current = null;
  }, [id]);

  useEffect(() => {
    if (id) {
      loadSensor();
    }
  }, [id, loadSensor]);

  const buildContextPayload = (): SensorContext | undefined => {
    const historicalDays = toPositiveIntOrUndefined(historicalWindowDays);

    const payload: SensorContext = {
      domain: domain || undefined,
      environment_type: environmentType || undefined,
      indoor_outdoor: indoorOutdoor || undefined,
      asset_type: assetType.trim() || undefined,
      installation_notes: installationNotes.trim() || undefined,
      historical_window_days: historicalDays,
      location: locationCountry.trim() || locationRegion.trim() || locationLabel.trim()
        ? {
            mode: 'manual',
            country: locationCountry.trim() || undefined,
            region: locationRegion.trim() || undefined,
            label: locationLabel.trim() || undefined,
          }
        : undefined,
    };

    if (
      !payload.domain &&
      !payload.environment_type &&
      !payload.indoor_outdoor &&
      !payload.asset_type &&
      !payload.installation_notes &&
      !payload.historical_window_days &&
      !payload.location
    ) {
      return undefined;
    }

    return payload;
  };

  const handleAISuggest = async () => {
    if (!id || !purpose.trim()) {
      setPageError('Add a short purpose before asking AI for setup help.');
      return;
    }

    setAiLoading(true);
    setPageError(null);
    try {
      const request: AISuggestRequest = {
        purpose,
        context: buildContextPayload(),
      };

      const response = await getAISuggestedConfig(id, request);
      const config = response.validated_config || response.suggested_config;

      setFriendlyName(config.friendly_name);
      setReportsPerDay(config.report_interval_per_day.toString());
      setValidationStatus(response.validation_status || '');
      setValidationWarnings(response.warnings || []);
      setAiDraftSummary({
        explanation: response.explanation || 'AI drafted a starting configuration based on your purpose and context.',
        warnings: response.warnings || [],
        confidenceScore: response.confidence_score,
        requiresUserConfirmation: response.requires_user_confirmation,
      });

      const nextMetricThresholds: Record<string, MetricThresholdInput> = {};
      for (const metric of sensorMetrics) {
        const metricConfig =
          config.metric_thresholds?.[metric.key] ||
          (sensorMetrics.length === 1 ? config.thresholds : undefined);
        nextMetricThresholds[metric.key] = {
          mode: inferThresholdMode(metricConfig),
          min: metricConfig?.min?.toString() || '',
          max: metricConfig?.max?.toString() || '',
          warningMin: metricConfig?.warning_min?.toString() || '',
          warningMax: metricConfig?.warning_max?.toString() || '',
        };
      }
      setMetricThresholds(nextMetricThresholds);
    } catch (error: any) {
      setPageError(error.response?.data?.message || 'Failed to get AI setup help.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleSave = async () => {
    if (!id || !sensor) {
      return;
    }

    if (!friendlyName.trim()) {
      setPageError('Please enter a sensor name before saving.');
      return;
    }

    setSaving(true);
    setPageError(null);
    try {
      const reports = readingFlowType === 'TRIGGER' ? 1 : (reportsPerDay ? parseInt(reportsPerDay, 10) : 24);
      const metricThresholdPayload: Record<string, MetricThresholdPayload> = Object.fromEntries(
        sensorMetrics.map((metric) => {
          const values = metricThresholds[metric.key] || emptyMetricThresholdInput();
          return [
            metric.key,
            {
              min: toNumberOrUndefined(values.min),
              max: toNumberOrUndefined(values.max),
              warning_min: toNumberOrUndefined(values.warningMin),
              warning_max: toNumberOrUndefined(values.warningMax),
            },
          ];
        })
      );

      const primaryMetricKey = sensorMetrics[0]?.key;
      const primaryMetricThreshold: MetricThresholdPayload = primaryMetricKey
        ? metricThresholdPayload[primaryMetricKey] || {}
        : {};

      const config: SensorConfigPayload = {
        friendly_name: friendlyName.trim(),
        thresholds: {
          min: primaryMetricThreshold.min,
          max: primaryMetricThreshold.max,
          warning_min: primaryMetricThreshold.warning_min,
          warning_max: primaryMetricThreshold.warning_max,
        },
        metric_thresholds: metricThresholdPayload,
        report_interval_per_day: reports,
        power_management: {
          battery_life_days: estimatedBatteryLifeDays,
          sampling_frequency: reports,
        },
      };

      const response = await saveSensorConfig(id, {
        purpose: purpose.trim(),
        context: isAiAssisted ? buildContextPayload() : undefined,
        config,
      });

      const successState = {
        configurationSaved: true,
        configuredSensorId: sensor.id,
        configuredSensorName: response.validated_config.friendly_name,
        validationWarnings: response.warnings || [],
        observationMessage:
          response.observation?.message ||
          'The system is now observing live readings and can suggest refinements later.',
      };

      if (navigationState?.returnTo) {
        navigate(navigationState.returnTo, {
          replace: true,
          state: successState,
        });
        return;
      }

      if ((window.history.state?.idx ?? 0) > 0) {
        navigate(-1);
        return;
      }

      navigate(`/controllers/${sensor.controller_id}`, {
        replace: true,
        state: successState,
      });
    } catch (error: any) {
      setPageError(error.response?.data?.message || 'Failed to save configuration.');
    } finally {
      setSaving(false);
    }
  };

  const observationSeverity =
    sensor?.observation?.status === 'ready_for_review'
      ? 'success'
      : sensor?.observation?.status === 'awaiting_data'
        ? 'warning'
        : 'info';

  if (loading) {
    return <SensorConfigSkeleton />;
  }

  if (!sensor) {
    return (
      <Container>
        <Typography>Sensor not found</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 2, md: 3 } }}>
      <Paper elevation={0} sx={{ p: { xs: 2.5, md: 3.5 }, borderRadius: 2, border: '1px solid rgba(60, 57, 17, 0.1)' }}>
        <Box
          sx={{
            position: 'sticky',
            top: { xs: 12, md: 20 },
            zIndex: 5,
            display: 'flex',
            justifyContent: 'flex-start',
            mb: 1.5,
            pointerEvents: 'none',
          }}
        >
          <IconButton
            aria-label="Go back"
            onClick={handleBack}
            sx={{
              pointerEvents: 'auto',
              border: '1px solid rgba(60, 57, 17, 0.12)',
              bgcolor: '#fffdf8',
              boxShadow: '0 12px 24px rgba(60, 57, 17, 0.08)',
              '&:hover': {
                bgcolor: '#fff8ed',
              },
            }}
          >
            <ArrowBack />
          </IconButton>
        </Box>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} sx={{ mb: 2 }}>
          <Box>
            <Typography variant="overline" color="secondary" fontWeight={800}>
              Sensor setup
            </Typography>
            <Typography variant="h4">
              Configure {sensor.type} Sensor
            </Typography>
          </Box>
          <Box sx={{ p: 1.4, borderRadius: 2, bgcolor: 'rgba(108, 137, 48, 0.12)' }}>
            <Tune color="primary" />
          </Box>
        </Stack>

        {sensor.config_active && sensor.observation && (
          <Alert severity={observationSeverity} sx={{ mt: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
              Current observation status
            </Typography>
            <Typography variant="body2">{sensor.observation.message}</Typography>
          </Alert>
        )}

        {sensor.calibration_status === 'OVERDUE' && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            This sensor is overdue for calibration. The backend will still validate the configuration,
            but you should review thresholds carefully before using them for automation.
          </Alert>
        )}

        {pageError && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {pageError}
          </Alert>
        )}

        {validationWarnings.length > 0 && (
          <Alert severity={validationStatus === 'adjusted' ? 'warning' : 'info'} sx={{ mt: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              {validationStatus ? `Validation status: ${validationStatus}` : 'Validation feedback'}
            </Typography>
            <Box component="ul" sx={{ pl: 2, mb: 0 }}>
              {validationWarnings.map((warning) => (
                <li key={warning}>
                  <Typography variant="body2">{warning}</Typography>
                </li>
              ))}
            </Box>
          </Alert>
        )}

        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Setup Mode
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manual setup is the default. AI support is optional and only helps draft a starting
            configuration that you can still adjust before saving.
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mt: 2 }}>
            <Button
              variant={setupMode === 'manual' ? 'contained' : 'outlined'}
              onClick={() => setSetupMode('manual')}
              startIcon={<Tune />}
            >
              Manual Setup
            </Button>
            <Button
              variant={setupMode === 'ai_assisted' ? 'contained' : 'outlined'}
              onClick={() => setSetupMode('ai_assisted')}
              color="secondary"
              startIcon={<AutoAwesome />}
            >
              AI Support
            </Button>
          </Stack>
          <Alert severity={setupMode === 'manual' ? 'info' : 'success'} sx={{ mt: 2 }}>
            {setupMode === 'manual'
              ? 'Enter threshold values directly and save whenever you are ready. Context fields are skipped unless you turn on AI support.'
              : 'Use AI support to prefill values from your purpose and context, then review and edit anything before saving.'}
          </Alert>
        </Box>

        {isAiAssisted && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Context
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Optional but recommended. These details help with AI suggestions now and with better
              improvement recommendations after live data starts coming in.
            </Typography>

            <Grid container spacing={2} sx={{ mt: 0.5 }}>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel id="domain-label">Domain</InputLabel>
                  <Select
                    labelId="domain-label"
                    value={domain}
                    label="Domain"
                    onChange={(e) => setDomain(e.target.value)}
                  >
                    <MenuItem value="">Not specified</MenuItem>
                    <MenuItem value="agriculture">Agriculture</MenuItem>
                    <MenuItem value="home">Home</MenuItem>
                    <MenuItem value="industrial">Industrial</MenuItem>
                    <MenuItem value="warehouse">Warehouse</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel id="environment-type-label">Environment Type</InputLabel>
                  <Select
                    labelId="environment-type-label"
                    value={environmentType}
                    label="Environment Type"
                    onChange={(e) => setEnvironmentType(e.target.value)}
                  >
                    <MenuItem value="">Not specified</MenuItem>
                    <MenuItem value="farm">Farm</MenuItem>
                    <MenuItem value="greenhouse">Greenhouse</MenuItem>
                    <MenuItem value="home">Home</MenuItem>
                    <MenuItem value="warehouse">Warehouse</MenuItem>
                    <MenuItem value="industrial">Industrial</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel id="indoor-outdoor-label">Exposure</InputLabel>
                  <Select
                    labelId="indoor-outdoor-label"
                    value={indoorOutdoor}
                    label="Exposure"
                    onChange={(e) => setIndoorOutdoor(e.target.value)}
                  >
                    <MenuItem value="">Not specified</MenuItem>
                    <MenuItem value="indoor">Indoor</MenuItem>
                    <MenuItem value="outdoor">Outdoor</MenuItem>
                    <MenuItem value="mixed">Mixed</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Asset / Object"
                  value={assetType}
                  onChange={(e) => setAssetType(e.target.value)}
                  placeholder="e.g., tomato crop, storage room, garbage bin"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Observation / History Window (Days)"
                  type="number"
                  value={historicalWindowDays}
                  onChange={(e) => setHistoricalWindowDays(e.target.value)}
                  helperText="Used for AI review of recent readings and later improvement suggestions."
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Country"
                  value={locationCountry}
                  onChange={(e) => setLocationCountry(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Region / City"
                  value={locationRegion}
                  onChange={(e) => setLocationRegion(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Location Label"
                  value={locationLabel}
                  onChange={(e) => setLocationLabel(e.target.value)}
                  placeholder="e.g., Jaffna greenhouse A"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label="Installation Notes"
                  value={installationNotes}
                  onChange={(e) => setInstallationNotes(e.target.value)}
                  placeholder="e.g., near south wall, partial shade in afternoon"
                />
              </Grid>
            </Grid>
          </Box>
        )}

        {setupMode === 'ai_assisted' && (
          <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            AI Support
          </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Describe what this sensor is for, then let AI draft threshold and reporting values that
              you can still fine-tune manually.
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={4}
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="e.g., Monitor garbage bin fill level and odor for a 120L outdoor bin using cm level readings"
              sx={{ mt: 1 }}
            />

            <Button
              variant="contained"
              color="secondary"
              onClick={handleAISuggest}
              disabled={aiLoading || !purpose.trim()}
              sx={{ mt: 2 }}
              startIcon={<AutoAwesome />}
            >
              {aiLoading ? 'Generating AI Draft...' : 'Generate AI Draft'}
            </Button>

            {aiDraftSummary && (
              <Alert severity={aiDraftSummary.warnings.length > 0 ? 'warning' : 'success'} sx={{ mt: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                  AI draft ready
                </Typography>
                <Typography variant="body2">{aiDraftSummary.explanation}</Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Confidence score: {aiDraftSummary.confidenceScore.toFixed(2)}
                </Typography>
                {aiDraftSummary.requiresUserConfirmation && (
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Review the draft carefully before saving because the backend flagged that it
                    still needs confirmation.
                  </Typography>
                )}
                {aiDraftSummary.warnings.length > 0 && (
                  <Box component="ul" sx={{ pl: 2, mb: 0, mt: 1 }}>
                    {aiDraftSummary.warnings.map((warning) => (
                      <li key={warning}>
                        <Typography variant="body2">{warning}</Typography>
                      </li>
                    ))}
                  </Box>
                )}
              </Alert>
            )}
          </Box>
        )}

        <Box sx={{ mt: 4 }}>
          <Typography variant="subtitle1" gutterBottom>
            Configuration
          </Typography>

          <TextField
            fullWidth
            label="Sensor Name *"
            value={friendlyName}
            onChange={(e) => setFriendlyName(e.target.value)}
            margin="normal"
            required
          />

          {sensorMetrics.map((metric) => (
            <Box key={metric.key} sx={{ mt: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                {metric.label} Thresholds
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                Choose whether this sensor should enforce a lower limit, an upper limit, or both.
              </Typography>
              <ToggleButtonGroup
                exclusive
                size="small"
                color="primary"
                value={metricThresholds[metric.key]?.mode || 'range'}
                onChange={(_, nextMode: ThresholdMode | null) => {
                  if (!nextMode) {
                    return;
                  }
                  setMetricThresholds((current) => ({
                    ...current,
                    [metric.key]: applyThresholdMode(
                      current[metric.key] || emptyMetricThresholdInput(),
                      nextMode
                    ),
                  }));
                }}
                sx={{ mb: 2, flexWrap: 'wrap' }}
              >
                <ToggleButton value="min">Only Min</ToggleButton>
                <ToggleButton value="max">Only Max</ToggleButton>
                <ToggleButton value="range">Min + Max</ToggleButton>
              </ToggleButtonGroup>
              <Grid container spacing={2}>
                {metricThresholds[metric.key]?.mode !== 'max' && (
                  <Grid item xs={12} md={metricThresholds[metric.key]?.mode === 'range' ? 6 : 12}>
                    <TextField
                      fullWidth
                      label="Min Value"
                      type="number"
                      value={metricThresholds[metric.key]?.min || ''}
                      onChange={(e) =>
                        setMetricThresholds((current) => ({
                          ...current,
                          [metric.key]: {
                            ...(current[metric.key] || emptyMetricThresholdInput()),
                            min: e.target.value,
                          },
                        }))
                      }
                    />
                  </Grid>
                )}
                {metricThresholds[metric.key]?.mode !== 'min' && (
                  <Grid item xs={12} md={metricThresholds[metric.key]?.mode === 'range' ? 6 : 12}>
                    <TextField
                      fullWidth
                      label="Max Value"
                      type="number"
                      value={metricThresholds[metric.key]?.max || ''}
                      onChange={(e) =>
                        setMetricThresholds((current) => ({
                          ...current,
                          [metric.key]: {
                            ...(current[metric.key] || emptyMetricThresholdInput()),
                            max: e.target.value,
                          },
                        }))
                      }
                    />
                  </Grid>
                )}
              </Grid>

              <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
                {metric.label} Warning Thresholds (Optional)
              </Typography>
              <Grid container spacing={2}>
                {metricThresholds[metric.key]?.mode !== 'max' && (
                  <Grid item xs={12} md={metricThresholds[metric.key]?.mode === 'range' ? 6 : 12}>
                    <TextField
                      fullWidth
                      label="Warning Min"
                      type="number"
                      value={metricThresholds[metric.key]?.warningMin || ''}
                      onChange={(e) =>
                        setMetricThresholds((current) => ({
                          ...current,
                          [metric.key]: {
                            ...(current[metric.key] || emptyMetricThresholdInput()),
                            warningMin: e.target.value,
                          },
                        }))
                      }
                    />
                  </Grid>
                )}
                {metricThresholds[metric.key]?.mode !== 'min' && (
                  <Grid item xs={12} md={metricThresholds[metric.key]?.mode === 'range' ? 6 : 12}>
                    <TextField
                      fullWidth
                      label="Warning Max"
                      type="number"
                      value={metricThresholds[metric.key]?.warningMax || ''}
                      onChange={(e) =>
                        setMetricThresholds((current) => ({
                          ...current,
                          [metric.key]: {
                            ...(current[metric.key] || emptyMetricThresholdInput()),
                            warningMax: e.target.value,
                          },
                        }))
                      }
                    />
                  </Grid>
                )}
              </Grid>
            </Box>
          ))}

          <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
            Reading & Power Settings
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ color: 'primary.main', mb: 1 }}>
            <BatteryChargingFull />
            <Typography variant="body2" fontWeight={800}>
              Estimated runtime updates as reporting frequency changes.
            </Typography>
          </Stack>
          <FormControl fullWidth sx={{ mt: 1 }}>
            <InputLabel id="reading-flow-type-label">Reading Flow Type</InputLabel>
            <Select
              labelId="reading-flow-type-label"
              value={readingFlowType}
              label="Reading Flow Type"
              onChange={(e) => setReadingFlowType(e.target.value as 'CONSTANT_PER_DAY' | 'TRIGGER')}
            >
              <MenuItem value="CONSTANT_PER_DAY">Constant readings per day</MenuItem>
              <MenuItem value="TRIGGER">Trigger-based readings</MenuItem>
            </Select>
          </FormControl>
          <TextField
            fullWidth
            label="Reports Per Day"
            type="number"
            value={reportsPerDay}
            onChange={(e) => setReportsPerDay(e.target.value)}
            margin="normal"
            disabled={readingFlowType === 'TRIGGER'}
            helperText="How many times per day the sensor should send data"
          />
          <TextField
            fullWidth
            label="Estimated Battery Life (Days)"
            type="number"
            value={estimatedBatteryLifeDays.toString()}
            margin="normal"
            InputProps={{ readOnly: true }}
            helperText="Automatically calculated from reports/day and sensor metrics"
          />
        </Box>

        <Alert severity="info" sx={{ mt: 3 }}>
          Saving activates this configuration immediately. After live readings start coming in, the
          system will keep observing in the background and can suggest better refinements later.
        </Alert>

        <Button
          variant="contained"
          color="secondary"
          fullWidth
          onClick={handleSave}
          disabled={saving}
          sx={{ mt: 3 }}
        >
          {saving ? 'Saving...' : 'Save and Activate Configuration'}
        </Button>
      </Paper>
    </Container>
  );
};

export default SensorConfig;
