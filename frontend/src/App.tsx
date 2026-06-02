import { useEffect, useMemo, useState } from "react";
import BarChartIcon from "@mui/icons-material/BarChart";
import CoffeeIcon from "@mui/icons-material/LocalCafe";
import LineChartIcon from "@mui/icons-material/ShowChart";
import PlaceIcon from "@mui/icons-material/Place";
import StarIcon from "@mui/icons-material/Star";
import {
  AppBar,
  Box,
  ButtonBase,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Drawer,
  Grid,
  Stack,
  Toolbar,
  Typography,
} from "@mui/material";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart as ReLineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { apiGet } from "./api/client";
import type { LocationDto, LocationMonthlyStatDto } from "./api/types";

function StatCard({
  title,
  value,
  subtitle,
  icon,
}: {
  title: string;
  value: string;
  subtitle?: string;
  icon?: React.ReactNode;
}) {
  return (
    <Card variant="outlined">
      <CardHeader
        title={
          <Stack direction="row" spacing={1} alignItems="center">
            {icon ? <Box sx={{ color: "text.secondary" }}>{icon}</Box> : null}
            <Typography variant="subtitle2">{title}</Typography>
          </Stack>
        }
        subheader={subtitle ? <Typography variant="body2">{subtitle}</Typography> : undefined}
      />
      <CardContent sx={{ pt: 0 }}>
        <Typography variant="h4" fontWeight={700} letterSpacing={-0.5}>
          {value}
        </Typography>
      </CardContent>
    </Card>
  );
}

const drawerWidth = 300;

export default function App() {
  const [locations, setLocations] = useState<LocationDto[]>([]);
  const [locationsLoading, setLocationsLoading] = useState(true);
  const [locationsError, setLocationsError] = useState<string | null>(null);

  const [selectedLocationId, setSelectedLocationId] = useState<string>("");

  const [stats, setStats] = useState<LocationMonthlyStatDto[]>([]);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState<string | null>(null);

  const selectedLocation = useMemo(
    () => locations.find((l) => l.id === selectedLocationId) ?? null,
    [locations, selectedLocationId]
  );

  useEffect(() => {
    let cancelled = false;

    async function loadLocations() {
      setLocationsLoading(true);
      setLocationsError(null);
      try {
        const data = await apiGet<LocationDto[]>("/api/locations");
        if (cancelled) return;
        setLocations(data);
        if (!selectedLocationId && data[0]?.id) setSelectedLocationId(data[0].id);
      } catch (err) {
        if (cancelled) return;
        setLocationsError(err instanceof Error ? err.message : "Failed to load locations");
      } finally {
        if (!cancelled) setLocationsLoading(false);
      }
    }

    loadLocations();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let cancelled = false;
    if (!selectedLocationId) return;

    async function loadStats() {
      setStatsLoading(true);
      setStatsError(null);
      try {
        const data = await apiGet<LocationMonthlyStatDto[]>(
          `/api/locations/${encodeURIComponent(selectedLocationId)}/stats`
        );
        if (cancelled) return;
        setStats(data);
      } catch (err) {
        if (cancelled) return;
        setStats([]);
        setStatsError(err instanceof Error ? err.message : "Failed to load stats");
      } finally {
        if (!cancelled) setStatsLoading(false);
      }
    }

    loadStats();
    return () => {
      cancelled = true;
    };
  }, [selectedLocationId]);

  const avgRatingAllTime = useMemo(() => {
    if (!stats.length) return null;
    const sum = stats.reduce((acc, s) => acc + s.avgRating, 0);
    return sum / stats.length;
  }, [stats]);

  const totalNewReviews = useMemo(() => stats.reduce((acc, s) => acc + s.count, 0), [stats]);

  return (
    <Box sx={{ display: "flex", height: "100vh", bgcolor: "background.default" }}>
      <AppBar position="fixed" color="transparent" elevation={0} sx={{ zIndex: (t) => t.zIndex.drawer + 1 }}>
        <Toolbar sx={{ gap: 1 }}>
          <CoffeeIcon />
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Black Honey
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Reputation Dashboard
          </Typography>
        </Toolbar>
        <Divider />
      </AppBar>

      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: "border-box" },
        }}
      >
        <Toolbar />
        <Box sx={{ p: 2 }}>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
            <PlaceIcon fontSize="small" color="action" />
            <Typography variant="overline" color="text.secondary">
              Locations
            </Typography>
          </Stack>

          <Stack spacing={1}>
            {locationsLoading ? (
              <Typography variant="body2" color="text.secondary">
                Loading locations…
              </Typography>
            ) : locationsError ? (
              <Typography variant="body2" color="error">
                {locationsError}
              </Typography>
            ) : locations.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No locations found. Run the import script to add data.
              </Typography>
            ) : (
              locations.map((loc) => {
                const active = loc.id === selectedLocationId;
                return (
                  <ButtonBase
                    key={loc.id}
                    onClick={() => setSelectedLocationId(loc.id)}
                    style={{ width: "100%" }}
                  >
                    <Card
                      variant={active ? "elevation" : "outlined"}
                      sx={{
                        width: "100%",
                        textAlign: "left",
                        p: 1.25,
                        bgcolor: active ? "action.selected" : "background.paper",
                      }}
                    >
                      <Typography variant="subtitle2" noWrap>
                        {loc.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {loc.address}
                      </Typography>
                    </Card>
                  </ButtonBase>
                );
              })
            )}
          </Stack>
        </Box>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, overflow: "auto" }}>
        <Toolbar />
        <Box sx={{ px: 3, py: 3, maxWidth: 1200, mx: "auto" }}>
          <Typography variant="h4" fontWeight={800} letterSpacing={-0.5}>
            Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 2 }}>
            {selectedLocation ? selectedLocation.name : "Select a location"}
          </Typography>

          {statsError ? (
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="error">
                Stats error: {statsError}
              </Typography>
            </Box>
          ) : null}

          <Grid container spacing={2}>
            <Grid size={{xs: 12, sm: 6, md: 4}}>
              <StatCard
                title="Avg rating"
                value={
                  statsLoading ? "Loading…" : avgRatingAllTime == null ? "—" : avgRatingAllTime.toFixed(2)
                }
                subtitle="Average of monthly averages"
                icon={<StarIcon fontSize="small" />}
              />
            </Grid>
            <Grid size={{xs: 12, sm: 6, md: 4}}>
              <StatCard
                title="Total reviews"
                value={
                  selectedLocation ? selectedLocation.totalReviews.toLocaleString() : locationsLoading ? "Loading…" : "—"
                }
                subtitle="Location total"
                icon={<BarChartIcon fontSize="small" />}
              />
            </Grid>
            <Grid size={{xs: 12, sm: 6, md: 4}}>
              <StatCard
                title="New reviews (period)"
                value={statsLoading ? "Loading…" : stats.length ? totalNewReviews.toLocaleString() : "—"}
                subtitle="Sum of monthly counts"
                icon={<LineChartIcon fontSize="small" />}
              />
            </Grid>

            <Grid size={{xs: 12, lg: 6}}>
              <Card variant="outlined">
                <CardHeader
                  title={
                    <Stack direction="row" spacing={1} alignItems="center">
                      <LineChartIcon fontSize="small" />
                      <Typography variant="subtitle2">Rating trend</Typography>
                    </Stack>
                  }
                  subheader={<Typography variant="body2">Average rating by month</Typography>}
                />
                <CardContent sx={{ pt: 0 }}>
                  <Box sx={{ height: 320 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <ReLineChart data={stats} margin={{ left: 8, right: 8, top: 8, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis domain={[0, 5]} />
                        <Tooltip />
                        <Line type="monotone" dataKey="avgRating" stroke="#1f2937" strokeWidth={2} dot={{ r: 3 }} />
                      </ReLineChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid  size={{xs: 12, lg: 6}}>
              <Card variant="outlined">
                <CardHeader
                  title={
                    <Stack direction="row" spacing={1} alignItems="center">
                      <BarChartIcon fontSize="small" />
                      <Typography variant="subtitle2">Review volume</Typography>
                    </Stack>
                  }
                  subheader={<Typography variant="body2">New reviews per month</Typography>}
                />
                <CardContent sx={{ pt: 0 }}>
                  <Box sx={{ height: 320 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={stats} margin={{ left: 8, right: 8, top: 8, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" fill="#1f2937" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Box>
  );
}

