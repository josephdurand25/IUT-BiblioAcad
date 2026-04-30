import React from 'react'
import { Button } from '../../components/Button'
import { Input } from '../../components/Input';
import { Select } from '../../components/Select';


function Users() {
      
    // etat pour le theme et la langue
      const [selectedTheme, setSelectedTheme] = React.useState<string>("");
      const [selectedLanguage, setSelectedLanguage] = React.useState<string>("");

    //   fonction de gestion du changement de la langue et du theme
      const handleLanguageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedLanguage(event.target.value);
      };

      const handleThemeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedTheme(event.target.value);
      };

  return (
    <div className="">
       <div className="space-y-6">
    <div className="space-y-1">
      <h1 className="text-xl font-bold tracking-tight">Paramètres</h1>
      <p className="text-sm">gerer vos preferences d'application et autres</p>
    </div>

    <div className="bg-white p-6 rounded-lg shadow-md space-y-6">
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Paramettres de profil</h2>
      </div>
      <div className="space-y-4">
        <div className="space-y-2">
          <Input 
            labelText="Full Name"
            name='full name'
            type="text" 
            placeholder="John Doe" 
            inputStyle="w-full p-2 border border-input rounded-md bg-background"
          />
        </div>
        <div className="space-y-2">
          <Input 
            labelText="Email Address"
            name='email'
            type="email" 
            placeholder="john@example.com" 
            inputStyle="w-full p-2 border border-input rounded-md bg-background"
          />
        </div>
        <div className="space-y-2">
         
          <Input
            labelText="Filiere"
            name='Filiere' 
            type="text" 
            placeholder="Sales Manager" 
            inputStyle="w-full p-2 border border-input rounded-md bg-background"
          />
        </div>
        <Button 
            variant='slate'
            name='saveChanges'
            size='small'
        >Save Changes</Button>
      </div>
    </div>

    <div className="bg-white p-6 rounded-lg shadow-md space-y-6">
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Notification Preferences</h2>
      </div>
      <div className="space-y-4">
          <div className="flex items-center justify-between">
                <div>
                    <div className="font-medium">Email Notifications</div>
                    <div className="text-sm text-muted-foreground">Receive email updates for important events</div>
                </div>
                <input type="checkbox" checked className="w-4 h-4 rounded border-input" />
          </div>
          <div className="flex items-center justify-between">
                <div>
                    <div className="font-medium">Deal Updates</div>
                    <div className="text-sm text-muted-foreground">Get notified when deals change status</div>
                </div>
                <input type="checkbox" checked className="w-4 h-4 rounded border-input" />
            </div>
            <div className="flex items-center justify-between">
                <div>
                    <div className="font-medium">Task Reminders</div>
                    <div className="text-sm text-muted-foreground">Receive reminders for upcoming tasks</div>
                </div>
                <input type="checkbox" className="w-4 h-4 rounded border-input" />
            </div>
      </div>
    </div>

    <div className="bg-white p-6 rounded-lg shadow-md space-y-6">
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Parametres d'Affichage</h2>
      </div>
      <div className="space-y-4">
            <div className="space-y-2">
            <Select 
                labelText=" Theme"
                indication='Choisir le theme'
                name="theme"
                id="theme"
                value={selectedTheme}
                onChange={handleThemeChange}
               styleSelect="w-full px-3 py-2 border border-input rounded-md bg-background"

                options ={  [
                  {id:1, value:"LI", label:"Light"},
                  {id:2, value:"Da", label:"Dark"},
                  {id:3, value:"SYS", label:"System"}
                 ]} 
            />
            </div>
            <div className="space-y-2">
            
            <Select 
                labelText=" Langue"
                indication='Choisir la langue'
                name="language"
                id="language" 
                value={selectedLanguage}
                onChange={handleLanguageChange}
                styleSelect="w-full px-3 py-2 border border-input rounded-md bg-background"

                options ={  [
                  {id:1, value:"EN", label:"English"},
                  {id:2, value:"ES", label:"Spanish"},
                  {id:3, value:"FR", label:"French"},
                  {id:4, value:"DE", label:"German"}
                 ]}
                
            />
            </div>
            <Button size="small" variant='slate'>Save Changes</Button>
      </div>
    </div>
    </div>
    </div>
  )
}

export default Users;
