import { useState, useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { Navbar } from '../components/Navbar';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';
import { User, Mail, Save, RefreshCw, CheckCircle2, Settings as SettingsIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PRESET_AVATARS = [
  'Midnight', 'Luna', 'Felix', 'Aura', 'Jasper', 
  'Mimi', 'Oliver', 'Shadow', 'Ginger', 'Snow'
];

const AVATAR_STYLE = 'lorelei';

const SettingsPage = () => {
  const { user, updateUser } = useAuthStore();
  const [name, setName] = useState(user?.name || '');
  const [avatarSeed, setAvatarSeed] = useState(user?.avatarSeed || user?.name || 'Carlos');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setAvatarSeed(user.avatarSeed || user.name || 'Carlos');
    }
  }, [user]);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await updateUser({ name, avatarSeed });
      toast.success('Settings updated successfully');
    } catch (err) {
      toast.error('Failed to update settings');
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const generateRandomSeed = () => {
    const randomString = Math.random().toString(36).substring(7);
    setAvatarSeed(randomString);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <Navbar />
      
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-10"
        >
          <div className="p-3 rounded-2xl bg-primary/10 text-primary">
            <SettingsIcon size={32} />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-foreground tracking-tight">Settings</h1>
            <p className="text-muted-foreground">Manage your account preferences and profile</p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Avatar Section */}
          <div className="md:col-span-1">
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden sticky top-24">
              <CardHeader className="text-center pb-2">
                <CardTitle>Profile Picture</CardTitle>
                <CardDescription>Customize your avatar</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center gap-6 pt-4">
                <div className="relative group">
                  <motion.div 
                    key={avatarSeed}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="h-32 w-32 md:h-40 md:w-40 rounded-full border-4 border-primary/20 p-1 bg-background shadow-2xl relative z-10"
                  >
                    <img
                      src={`https://api.dicebear.com/7.x/${AVATAR_STYLE}/png?seed=${avatarSeed}`}
                      alt="Avatar Preview"
                      className="w-full h-full rounded-full object-cover"
                    />
                  </motion.div>
                  <div className="absolute inset-0 bg-primary/5 rounded-full blur-2xl -z-0 opacity-50" />
                </div>
                
                <div className="grid grid-cols-5 gap-2 w-full">
                  {PRESET_AVATARS.map((seed) => (
                    <button
                      key={seed}
                      onClick={() => setAvatarSeed(seed)}
                      className={`h-10 w-10 rounded-full border-2 transition-all p-0.5 overflow-hidden ${
                        avatarSeed === seed ? 'border-primary ring-2 ring-primary/20 scale-110' : 'border-transparent hover:border-primary/50'
                      }`}
                    >
                      <img
                        src={`https://api.dicebear.com/7.x/${AVATAR_STYLE}/png?seed=${seed}`}
                        alt={seed}
                        className="w-full h-full rounded-full object-cover"
                      />
                    </button>
                  ))}
                </div>

                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full gap-2 rounded-xl"
                  onClick={generateRandomSeed}
                >
                  <RefreshCw size={14} /> Randomize Seed
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Details Section */}
          <div className="md:col-span-2 space-y-6">
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User size={18} className="text-primary" /> Personal Details
                </CardTitle>
                <CardDescription>These details are visible to other users in quiz sessions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Display Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="pl-10 h-12 bg-background/50 border-border/50 focus:border-primary/50 focus:ring-primary/20 transition-all rounded-xl"
                      placeholder="Your name"
                    />
                  </div>
                </div>

                <div className="space-y-2 opacity-80">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                    <Input
                      id="email"
                      value={user?.email || ''}
                      disabled
                      className="pl-10 h-12 bg-muted/50 border-border/50 cursor-not-allowed rounded-xl"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <CheckCircle2 size={12} className="text-green-500" /> Account verified
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end pt-4">
              <Button 
                onClick={handleSave} 
                disabled={isSaving}
                className="gap-2 h-12 px-8 text-base font-semibold shadow-lg shadow-primary/20 rounded-xl transition-all active:scale-95"
              >
                {isSaving ? (
                  <RefreshCw className="h-5 w-5 animate-spin" />
                ) : (
                  <Save className="h-5 w-5" />
                )}
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SettingsPage;
