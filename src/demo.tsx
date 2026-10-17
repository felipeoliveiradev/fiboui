import React from 'react';
import { StakentCard, StakentButton, StakentSidebarItem, StakentBadge } from './layout/StakentComponents';
import { Grid, GridItem } from './structure/Grid';
import { Card } from './structure/Card';
import { ContentCard } from './structure/cards/ContentCard';
import { InfoCard, ActionCard, InputCard, MetricCard } from './structure/cards/variants';
import { Sidebar } from './layout/Sidebar';
import { Header } from './layout/Header';
import { DashboardLayout } from './layout/DashboardLayout';
import { createRoot, Root } from 'react-dom/client';
import {
  FiboThemeProvider,
  Column,
  Row,
  Text,
  Box,
  Button,
  useFiboTheme,
  AssetCard,
  ProfileCard,
  CollectionCard,
  List,
  Table,
  Badge,
  Avatar,
  Collapse,
  ScrollView,
  Spacer,
  Switch,
  Checkbox,
  RadioGroup,
  Textarea,
  TextField,
  Label,
  Select,
  Combobox,
  Image,
  Tags,
  Spinner,
  Skeleton,
  Alert,
  Progress
} from './index';

declare global {
  interface Window {
    _reactRoot?: Root;
  }
}

function LazyLoadingList() {
  const [items, setItems] = React.useState(() =>
    Array.from({ length: 10 }).map((_, i) => `Initial Item ${i}`)
  );
  const [loading, setLoading] = React.useState(false);

  const loadMore = () => {
    if (loading) return;
    setLoading(true);
    setTimeout(() => {
      setItems((prev) => [
        ...prev,
        ...Array.from({ length: 5 }).map((_, i) => `Loaded Item ${prev.length + i}`),
      ]);
      setLoading(false);
    }, 1000);
  };

  return ScrollView().vertical().style({ height: '100%' }).children(
    List()
      .width('100%')
      .items(items)
      .variant('default')
      .separator(true)
      .renderItem((item) =>
        Row().alignItems("center").justifyContent("between").className("w-full").children([
          Text(item as string).fontSize(14).build(),
          Badge().text("New").variant("dot").intent("success").build()
        ]).build()
      )
      .onEndReached(loadMore)
      .loading(loading)
      .build()
  ).build();
}

function DemoFormFields() {
  const [name, setName] = React.useState("");
  const [bio, setBio] = React.useState("");
  const [pass, setPass] = React.useState("");
  const [cpf, setCpf] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [role, setRole] = React.useState("dev");
  const [skills, setSkills] = React.useState(["css", "js"]);
  const [tech, setTech] = React.useState("react");
  const [techOptions, setTechOptions] = React.useState([
    { label: "React", value: "react" },
    { label: "Vue", value: "vue" },
    { label: "Angular", value: "ng" }
  ]);
  const [tags, setTags] = React.useState(["ux", "ui"]);
  const [tagOptions, setTagOptions] = React.useState([
    { label: "User Experience", value: "ux" },
    { label: "User Interface", value: "ui" },
    { label: "Accessibility", value: "a11y" }
  ]);

  const roles = [
    { label: "Developer", value: "dev" },
    { label: "Designer", value: "des" },
    { label: "Manager", value: "mgr" },
    { label: "Product Owner", value: "po" }
  ];
  const skillOptions = [
    { label: "HTML5", value: "html" },
    { label: "CSS3", value: "css" },
    { label: "JavaScript", value: "js" },
    { label: "TypeScript", value: "ts" },
    { label: "React", value: "react" }
  ];

  return Column().gap(20).children([
    TextField().label("Full Name").placeholder("John Doe").value(name).onChange(setName).build(),

    Column().gap(4).children([
      Label().text("Biography").required().htmlFor("bio-input").build(),
      Textarea().id("bio-input").placeholder("Tell us about yourself...").rows(4).value(bio).onChange(setBio).build()
    ]).build(),

    TextField().label("Password").type("password").value(pass).onChange(setPass).build(),
    TextField().label("CPF (Masked)").placeholder("999.999.999-99").mask("999.999.999-99").value(cpf).onChange(setCpf).build(),
    TextField().label("Email Address").type("email").placeholder("user@example.com").value(email).onChange(setEmail).build(),
    Select().label("Role").options(roles).value(role).onChange((val: string | string[]) => setRole(val as string)).build(),
    Select().label("Skills (Multi)").options(skillOptions).value(skills).onChange((val: string | string[]) => setSkills(val as string[])).multiple(true).build(),
    Combobox().label("Favorite Tech").options(techOptions).value(tech).onChange((val) => setTech(val as string)).onAdd((newLabel: string) => {
      const newVal = newLabel.toLowerCase().replace(/\s+/g, '-');
      setTechOptions([...techOptions, { label: newLabel, value: newVal }]);
      setTech(newVal);
    }).placeholder("Search or add...").build(),
    Combobox().label("Tags (Multi + Add)").options(tagOptions).value(tags).onChange((val) => setTags(val as string[])).onAdd((newLabel: string) => {
      const newVal = newLabel.toLowerCase().replace(/\s+/g, '-');
      setTagOptions([...tagOptions, { label: newLabel, value: newVal }]);
      setTags([...tags, newVal]);
    }).multiple(true).placeholder("Type to tag...").build()
  ]).build();
}

function DemoFormToggles() {
  const [email, setEmail] = React.useState(true);
  const [push, setPush] = React.useState(false);
  const [c1, setC1] = React.useState(true);
  const [c2, setC2] = React.useState(false);
  const [level, setLevel] = React.useState("mid");

  return Column().gap(24).children([
    Column().gap(12).children([
      Text("Notifications").variant("h6").className("text-gray-500 uppercase text-xs font-bold").build(),
      Column().gap(8).children([
        Switch().label("Email Notifications").checked(email).onChange(setEmail).build(),
        Switch().label("Push Notifications").checked(push).onChange(setPush).build(),
      ]).build()
    ]).build(),

    Column().gap(12).children([
      Text("Interests").variant("h6").className("text-gray-500 uppercase text-xs font-bold").build(),
      Row().gap(16).children([
        Checkbox().label("Coding").checked(c1).onChange(setC1).build(),
        Checkbox().label("Design").checked(c2).onChange(setC2).build(),
      ]).build()
    ]).build(),

    Column().gap(12).children([
      Text("Experience Level").variant("h6").className("text-gray-500 uppercase text-xs font-bold").build(),
      RadioGroup()
        .options([
          { label: "Junior", value: "jr" },
          { label: "Mid-Level", value: "mid" },
          { label: "Senior", value: "sr" }
        ])
        .value(level)
        .onChange(setLevel)
        .direction('horizontal')
        .build()
    ]).build(),
  ]).build();
}

const Gallery = () => {
  const { setTheme } = useFiboTheme();

  return (
      Box().classNames(['bg-gray-50', 'min-h-screen', 'p-12']).gap(14).children([

        Row().alignItems("center").justifyContent("between").classNames(['mb-12']).children([
             Column().gap(8).children([
                 Text("Latest Drops").fontSize(32).fontWeight(800).color("#111827").build(),
                 Text("Explore the new premium component system").fontSize(16).color("#6B7280").build(),
             ]).build(),

             Row().gap(8).children([
                 Button("Web").onPress(() => setTheme('web')).variant("outline").classNames(['bg-white']).build(),
                 Button("iOS").onPress(() => setTheme('cupertino')).variant("outline").classNames(['bg-white']).build(),
             ]).build()
        ]).build(),

        Box().classNames(['grid', 'grid-cols-12', 'gap-8']).children([

            Box().classNames(['col-span-3']).children([
                ProfileCard()
                    .name("Felipe O.")
                    .handle("@felipe")
                    .avatar("https://ui-avatars.com/api/?name=Felipe+Oliveira&background=random")
                    .stats({ items: "12K", owners: "450", floor: "0.2" })
                    .build(),

                Spacer().height(24).build(),

                Text("Design System Elements").variant("h6").className("mb-4 text-gray-500 uppercase tracking-widest text-xs font-bold").build(),

                Column().gap(12).children([
                    Text("Buttons").variant("body").className("text-gray-400 font-medium").build(),
                    Row().gap(8).children([
                        Button("Primary").variant("filled").build(),
                        Button("Soft").variant("soft").build(),
                        Button("Ghost").variant("ghost").build(),
                    ]).build(),

                    Text("Badges").variant("body").className("text-gray-400 font-medium mt-4").build(),
                    Row().gap(8).children([
                        Badge().text("Success").intent("success").variant("glass").build(),
                        Badge().text("Error").intent("error").variant("solid").build(),
                        Badge().text("Dot").intent("warning").variant("dot").build(),
                    ]).build(),

                    Text("Avatars").variant("body").className("text-gray-400 font-medium mt-4").build(),
                    Row().gap(8).alignItems("center").children([
                        Avatar().image("https://i.pravatar.cc/150?u=1").size(48).status("online").build(),
                        Avatar().image("https://i.pravatar.cc/150?u=2").size(40).shape("square").status("busy").build(),
                    ]).build(),

                    Text("Tags").variant("body").className("text-gray-400 font-medium mt-4").build(),
                    Tags().items([{ title: "React" }, { title: "TypeScript" }, { title: "Tailwind" }]).build(),

                    Text("Media").variant("body").className("text-gray-400 font-medium mt-4").build(),
                    Image("https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=300&q=80")
                        .clipShape('rounded')
                        .frame({ width: 200, height: 120 })
                        .build()
                ]).build()

            ]).build(),

            Box().classNames(['col-span-9']).children([
                Text("Trending Assets").variant("h2").className("mb-6").build(),

                Box().classNames(['grid', 'grid-cols-3', 'gap-6']).children([
                    AssetCard()
                        .title("Cosmic Cube #01")
                        .price("2.5 ETH")
                        .image("https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&w=800&q=80")
                        .build(),

                    AssetCard()
                        .title("Neon Genesis")
                        .price("1.8 ETH")
                        .image("https://images.unsplash.com/photo-1633101585226-8eb59b3924e0?auto=format&fit=crop&w=800&q=80")
                        .build(),

                    CollectionCard()
                        .title("Future Scapes")
                        .items("10k Items")
                        .author("Nova Labs")
                        .image("https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80")
                        .build()
                ]).build(),

                Box().classNames(['grid', 'grid-cols-2', 'gap-8', 'mt-12']).children([

                    Column().children([
                        Text("Recent Transactions").variant("h3").className("mb-4 text-gray-400").build(),
                        List()
                          .items(['Purchase #8292', 'Sale #1292', 'Transfer #9921', 'Mint #0001'])
                          .variant('floating')
                          .renderItem((item) =>
                              Row().justifyContent("between").alignItems("center").className("w-full").children([
                                  Row().gap(12).alignItems("center").children([
                                      Box().classNames(['bg-indigo-50', 'p-2', 'rounded-lg']).children(
                                          Text("#").color("#4F46E5").fontWeight(600).build()
                                      ).build(),
                                      Text(item as string).fontWeight(500).build()
                                  ]).build(),
                                  Text("-0.5 ETH").fontSize(14).color("#EF4444").build()
                              ]).build()
                          ).build()
                    ]).build(),

                    Column().children([
                       Text("Top Creators").variant("h3").className("mb-4 text-gray-400").build(),
                       Table()
                            .variant('clean')
                            .columns([
                                { header: "User", accessor: "user", render: (item: any) =>
                                    Row().gap(10).alignItems("center").children([
                                        Avatar().image(item.img).size(28).build(),
                                        Text(item.user).fontWeight(600).fontSize(14).build()
                                    ]).build()
                                },
                                { header: "Role", accessor: "role", render: (item: any) =>
                                     Badge().text(item.role).intent(item.role === 'Admin' ? 'info' : 'warning').variant('dot').build()
                                },
                                { header: "Team", accessor: "team" }
                            ])
                            .data([
                                { user: "Alice M.", role: "Admin", team: "Engineering", img: "https://i.pravatar.cc/150?u=5" },
                                { user: "Bob D.", role: "Editor", team: "Marketing", img: "https://i.pravatar.cc/150?u=6" },
                                { user: "Charlie", role: "Viewer", team: "Design", img: "https://i.pravatar.cc/150?u=7" }
                            ])
                            .build()
                    ]).build()
               ]).build(),

               Box().classNames(['mt-12']).children([
                   Text("Advanced Layouts & Interactions").variant("h2").className("mb-6").build(),

                   Text("Horizontal ScrollView (Carousel)").variant("body").className("mb-4 text-gray-500").build(),
                   ScrollView()
                     .horizontal()
                     .scrollbar('hidden')
                     .style({ gap: '16px', paddingBottom: '16px' })
                     .children([

                         ...[1,2,3,4,5].map(i =>
                            Box().style({ minWidth: '280px' }).children(
                                AssetCard()
                                    .title(`NFT #${i}42`)
                                    .image("https://images.unsplash.com/photo-1620912189869-90f855d2891d?auto=format&fit=crop&w=400&q=80")
                                    .price("1.2 ETH")
                                    .build()
                            ).build()
                         )
                     ])
                     .build(),

                   Spacer().height(32).build(),

                   Box().classNames(['grid', 'grid-cols-2', 'gap-8']).children([
                       Column().gap(12).children([
                           Text("Interactive Collapse").variant("h3").className("mb-4 text-gray-400").build(),
                           Collapse()
                             .title("What is FiboUI?")
                             .defaultOpen(true)
                             .content("FiboUI is a highly flexible, builder-pattern based component library designed for the next generation of web apps.")
                             .build(),
                           Collapse()
                             .title("How do I use ScrollView?")
                             .content("Simply wrap your content in ScrollView().horizontal().build() to get a native-feeling scrollable area without ugly scrollbars.")
                             .build(),
                           Collapse()
                             .title("Is it accessible?")
                             .content("Yes! We prioritize accessibility standards in all our core interactive elements.")
                             .build()
                       ]).build(),

                       Column().children([
                           Text("Lazy Loading List").variant("h3").className("mb-4 text-gray-400").build(),
                           Box().style({ width: '100%', height: '300px', overflowY: 'hidden', border: '1px solid #E5E7EB', borderRadius: '16px', backgroundColor: '#fff' }).children(
                             React.createElement(LazyLoadingList)
                           ).build()
                       ]).build()
                   ]).build()

               ]).build(),

               Box().classNames(['mt-12']).children([
                   Text("Form Elements").variant("h2").className("mb-6").build(),

                   Box().classNames(['grid', 'grid-cols-1', 'md:grid-cols-2', 'gap-12']).children([

                        React.createElement(DemoFormFields),

                        React.createElement(DemoFormToggles),
                   ]).build()

               ]).build(),

               Box().classNames(['mt-12']).children([
                   Text("Feedback Elements").variant("h2").className("mb-6").build(),

                   Box().classNames(['grid', 'grid-cols-1', 'md:grid-cols-2', 'gap-12']).children([

                       Column().gap(20).children([
                            Text("Alerts").variant("h6").className("text-gray-500 uppercase text-xs font-bold").build(),
                            Alert().title("Update Available").description("A new version of FiboUI is ready to install.").intent("info").build(),
                            Alert().title("Success!").description("Your changes have been saved successfully.").intent("success").build(),
                            Alert().title("Warning").description("Your storage is almost full.").intent("warning").build(),
                            Alert().title("Error").description("Failed to connect to server.").intent("error").build(),

                            Spacer().height(12).build(),

                            Text("Spinners").variant("h6").className("text-gray-500 uppercase text-xs font-bold").build(),
                            Row().gap(16).alignItems("center").children([
                                Spinner().variant("circle").size("lg").color("#3B82F6").build(),
                                Spinner().variant("dots").size("xl").color("#10B981").build(),
                                Spinner().variant("pulse").size("lg").color("#F59E0B").build(),
                                Spinner().variant("blocks").size("md").color("#EF4444").build(),
                            ]).build()
                       ]).build(),

                       Column().gap(20).children([
                            Text("Skeletons").variant("h6").className("text-gray-500 uppercase text-xs font-bold").build(),
                            Row().gap(12).children([
                                Skeleton().shape("circle").width(48).height(48).build(),
                                Column().gap(8).style({flex: 1}).children([
                                    Skeleton().width("60%").height(16).build(),
                                    Skeleton().width("90%").height(12).build(),
                                ]).build()
                            ]).build(),
                            Skeleton().width("100%").height(120).shape("rounded-lg").build(),

                            Spacer().height(12).build(),

                            Text("Progress").variant("h6").className("text-gray-500 uppercase text-xs font-bold").build(),
                            Column().gap(30).children([
                                Progress().variant("floating").value(25).color("#3B82F6").subLabel("5s left").build(),
                                Progress().variant("chevron").value(66).color("#2563EB").build(),
                                Progress().value(75).max(100).color("#3B82F6").build(),
                                Progress().variant("segments").value(50).color("#10B981").height(8).build(),
                                Progress().variant("knob").value(25).color("#F59E0B").height(6).build(),
                                Progress().variant("steps").value(66).color("#8B5CF6").build(),
                                Progress().variant("striped").value(45).color("#EC4899").build(),
                                Progress().variant("labeled").value(92).color("#06B6D4").build(),
                                Progress().variant("pagination").value(40).color("#8B5CF6").build(),
                                Progress().variant("timeline").value(60).color("#10B981")
                                    .items([
                                        { title: 'The shipment has arrived at the terminal', description: 'Tuesday, 28 May 2024' },
                                        { title: 'The shipment is being processed', description: 'Wednesday, 29 May 2024' },
                                        { title: 'Out for delivery', description: 'Thursday, 30 May 2024' },
                                        { title: 'Delivered', description: 'Pending' }
                                    ]).build(),
                                Row().gap(20).children([
                                    Progress().variant("circular").value(25).height(60).color("#6366F1").build(),
                                    Progress().variant("circular").value(65).height(60).color("#F59E0B").build(),
                                    Progress().variant("circular").value(50).label("3 of 6").height(80).color("#EF4444").build(),
                                ]).build()
                            ]).build()
                       ]).build()
                   ]).build(),

                   Text("Grid System").variant("h4").className("mb-4 mt-12 px-4").build(),

                   Text("Standard Grid (Social Media)").variant("h6").className("mb-4 px-4 text-gray-500").build(),
                   Grid().columns({ sm: 1, md: 2, lg: 4 }).gap("lg").className("px-4").children([
                        ContentCard()
                            .image("https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1000&auto=format&fit=crop")
                            .title("Austria: Panoramic Lake")
                            .source("Instagram")
                            .date("April 25, 2030")
                            .build(),
                        ContentCard()
                            .image("https://images.unsplash.com/photo-1516455590571-18256e5bb9ff?q=80&w=1000&auto=format&fit=crop")
                            .title("Ultimate Studio Tour")
                            .source("YouTube")
                            .date("April 22, 2030")
                            .build(),
                        ContentCard()
                            .image("https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=1000&auto=format&fit=crop")
                            .title("Morning Motivation")
                            .source("Twitter")
                            .date("April 26, 2030")
                            .build(),
                        ContentCard()
                            .image("https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1000&auto=format&fit=crop")
                            .title("New Vlog: Bali Adventures")
                            .source("YouTube")
                            .date("April 24, 2030")
                            .build(),
                   ]).build(),

                   Text("Bento Grid (Dashboard)").variant("h6").className("mb-4 mt-8 px-4 text-gray-500").build(),
                   Grid().variant("bento").columns({ sm: 1, md: 4 }).gap("md").className("px-4").children([

                       GridItem().colSpan(2).rowSpan(2).children([
                           Card()
                               .className("h-full text-white border-none relative overflow-hidden flex flex-col justify-center items-center p-8 text-center")
                               .style({ backgroundColor: '#4C1D95' })
                               .children([
                                   Text("PromptPal").className("uppercase tracking-widest text-sm opacity-70 mb-2").build(),
                                   Text("Your AI Prompt Companion").variant("h3").className("font-extrabold mb-6 relative z-10").build(),
                                   Box().className("w-32 h-32 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 blur-xl opacity-50 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2").build(),
                               ]).build()
                       ]).build(),

                       GridItem().colSpan(1).children([
                           Card()
                               .className("h-full text-white border-none flex items-center justify-center p-6")
                               .style({ backgroundColor: '#111827' })
                               .children([
                                   Text("✨").className("text-3xl").build()
                               ]).build()
                       ]).build(),

                       GridItem().colSpan(1).children([
                           Card()
                                .className("h-full text-white border-none flex flex-col items-center justify-center p-6")
                                .style({ backgroundColor: '#111827' })
                                .children([
                                    Text("25M").variant("h3").className("font-bold text-purple-400").build(),
                                    Text("created prompts").className("text-sm opacity-70").build()
                                ]).build()
                       ]).build(),

                        GridItem().colSpan(2).children([
                           Card()
                                .className("h-full text-white border-none p-6 flex flex-col justify-between")
                                .style({ backgroundColor: '#111827' })
                                .children([
                                    Text("12K").variant("h3").className("font-bold text-orange-400").build(),
                                    Text("Happy Users").className("text-sm opacity-70").build(),
                                    Row().className("mt-4 -space-x-2").children([
                                        Avatar().image("https://i.pravatar.cc/100?img=1").build(),
                                        Avatar().image("https://i.pravatar.cc/100?img=2").build(),
                                        Avatar().image("https://i.pravatar.cc/100?img=3").build(),
                                    ]).build()
                                ]).build()
                       ]).build(),
                   ]).build(),

                   Text("Masonry Layout (Pinterest)").variant("h6").className("mb-4 mt-8 px-4 text-gray-500").build(),
                   Grid().variant("masonry").columns({ sm: 2, md: 3, lg: 4 }).gap("md").className("px-4").children([
                        Image().src("https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=500&q=80").className("w-full rounded-xl").build(),
                        Image().src("https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=500&q=80").className("w-full rounded-xl").build(),
                        Card()
                            .className("text-white p-8 rounded-xl")
                            .style({ backgroundColor: '#EF4444' })
                            .children([Text("Quote of the day: Design is intelligence made visible.").className("font-bold text-xl").build()]).build(),
                        Image().src("https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=500&q=80").className("w-full rounded-xl").build(),
                        Image().src("https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500&q=80").className("w-full rounded-xl").build(),
                        Card()
                            .className("text-white p-12 rounded-xl flex items-center justify-center")
                            .style({ backgroundColor: '#10B981' })
                            .children([Text("🥑").className("text-6xl").build()]).build(),
                        Image().src("https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=500&q=80").className("w-full rounded-xl").build(),
                        Image().src("https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&q=80").className("w-full rounded-xl").build(),
                   ]).build(),

                   Text("Card Variations (Component System)").variant("h4").className("mb-4 mt-12 px-4").build(),
                   Grid().columns({ sm: 1, md: 2, lg: 4 }).gap("md").className("px-4").children([

                        InfoCard()
                            .title("Getting Started")
                            .description("Learn the basics of FiboUI in less than 5 minutes.")
                            .icon(Box().className("i-heroicons-book-open text-2xl").build())
                            .build(),
                        InfoCard()
                            .title("Documentation")
                            .description("Explore the full API reference and examples.")
                            .footer(Button("View Docs").variant("ghost").size("sm").build())
                            .build(),

                        ActionCard()
                           .title("Notifications")
                           .description("Enable push notifications")
                           .withSwitch((val) => console.log(val))
                           .build(),
                        ActionCard()
                           .title("Account Status")
                           .description("Your account is currently active")
                           .withButton("Deactivate")
                           .build(),

                        MetricCard()
                            .title("Total Revenue")
                            .value("$45,231.89")
                            .trend("12%", "up")
                            .build(),
                        MetricCard()
                            .title("Active Users")
                            .value("1,234")
                            .trend("2.1%", "down")
                            .build(),

                        InputCard()
                            .title("Email Address")
                            .description("We'll never share your email.")
                            .placeholder("you@example.com")
                            .build(),
                        InputCard()
                            .title("Workspace Name")
                            .placeholder("Acme Inc.")
                            .build(),
                   ]).build(),

                   Box().height(100).build(),

                   Text("Layout System (Premium Dark Dashboard)").variant("h4").className("mb-4 px-4").build(),
                   Text("A high-fidelity implementation of the requested dark structural layout using custom Stakent components.").className("mb-8 px-4 text-gray-500").build(),

                   Box().className("border border-gray-800 rounded-3xl overflow-hidden shadow-2xl mx-4 relative font-sans").style({ height: '850px', backgroundColor: '#0B0C15' }).children([
                       DashboardLayout()
                           .className("h-full text-white selection:bg-indigo-500/30")
                           .style({ backgroundColor: '#0B0C15' })

                           .sidebar(
                               Sidebar()
                                   .width(260)
                                   .className("border-r border-white/5 bg-[#0B0C15] flex flex-col pt-6")
                                   .children([

                                       Box().className("px-6 mb-8 flex items-center gap-3").children([
                                            Box().className("w-9 h-9 rounded-xl bg-white flex items-center justify-center text-black font-extrabold text-lg shadow-lg shadow-white/10").children("S").build(),
                                            Column().gap(2).children([
                                                Text("Stakent").className("font-bold text-lg text-white leading-none tracking-tight").build(),
                                                Text("TOP STAKING ASSETS").className("text-[9px] text-gray-500 font-bold uppercase tracking-[0.1em]").build(),
                                            ]).build()
                                       ]).build(),

                                       Box().className("px-6 mb-8").children([
                                            Box().className("flex p-1 bg-[#151621] rounded-xl border border-white/5").children([
                                                StakentButton({ text: "Staking", variant: "primary", className: "flex-1 text-xs py-2 shadow-none" }),
                                                StakentButton({ text: "Stablecoin", variant: "ghost", className: "flex-1 text-xs py-2" }),
                                            ]).build()
                                       ]).build(),

                                       Column().gap(4).className("px-4 flex-1").children([
                                           StakentSidebarItem({ label: "Dashboard", active: true, icon: "i-heroicons-squares-2x2" }),
                                           StakentSidebarItem({ label: "Assets", icon: "i-heroicons-banknotes" }),
                                           StakentSidebarItem({ label: "Staking Providers", icon: "i-heroicons-server" }),
                                           StakentSidebarItem({ label: "Calculator", icon: "i-heroicons-calculator" }),
                                           StakentSidebarItem({ label: "Data API", icon: "i-heroicons-code-bracket" }),

                                           Box().height(40).build(),

                                           Row().className("justify-between items-center px-4 mb-3").children([
                                                Text("ACTIVE STAKING").className("text-[10px] font-bold text-gray-500 uppercase tracking-[0.1em]").build(),
                                                Box().className("w-5 h-5 rounded-full bg-[#1A1B23] border border-white/10 text-white text-[10px] flex items-center justify-center font-bold").children("1").build()
                                           ]).build(),

                                           Box().className("mx-2 p-3 bg-[#13141C] border border-white/5 rounded-2xl relative group cursor-pointer hover:border-[#6366f1]/30 transition-colors").children([
                                               Row().className("items-center justify-between").children([
                                                   Row().gap(3).className("items-center").children([
                                                       Box().className("w-9 h-9 rounded-full bg-[#1A1B23] flex items-center justify-center border border-white/5 p-1.5").children([
                                                           Image().src("https://upload.wikimedia.org/wikipedia/commons/6/6f/Ethereum-icon-purple.svg").className("w-full h-full").build()
                                                       ]).build(),
                                                       Column().children([
                                                           Text("Ethereum").className("text-xs font-bold text-white").build(),
                                                           Text("$7,699.00").className("text-[10px] text-gray-500 font-medium").build()
                                                       ]).build()
                                                   ]).build(),
                                                   Box().className("w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]").build()
                                               ]).build()
                                           ]).build()
                                       ]).build(),

                                       Box().className("p-6 border-t border-white/5").children([
                                            Row().gap(3).className("items-center").children([
                                                Avatar().image("https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?fit=crop&w=100&h=100").size(40).className("border-2 border-[#1A1B23] shadow-lg").build(),
                                                Column().children([
                                                    Text("Ryan Crawford").className("text-xs font-bold text-white").build(),
                                                    Text("Pro Member").className("text-[10px] text-[#6366f1] font-bold uppercase tracking-wide").build()
                                                ]).build(),
                                                Button().icon(Box().className("i-heroicons-cog-6-tooth w-5 h-5 text-gray-500").build()).variant("ghost").size("sm").className("ml-auto hover:text-white hover:bg-white/5").build()
                                            ]).build()
                                       ]).build()
                                   ])
                                   .build()
                           )

                           .header(
                               Header()
                                   .height(100)
                                   .className("bg-[#0B0C15]/90 backdrop-blur-xl flex justify-between px-10 items-center z-50")
                                   .children([
                                       Box().className("flex flex-col justify-center gap-1.5").children([
                                            Row().alignItems("center").gap(4).children([
                                                Row().alignItems("center").gap(2).className("text-[10px] text-gray-400 font-medium tracking-wide").children([
                                                    Box().className("i-heroicons-clock w-3 h-3").build(),
                                                    Text("Recommended coins for 24 hours").className("text-[10px] text-gray-400 font-medium tracking-wide").build()
                                                ]).build(),
                                                Box().className("bg-[#1A1B23] border border-white/5 px-2 py-0.5 rounded-md text-[9px] text-gray-400 font-bold").children("3 Assets").build()
                                            ]).build(),
                                            Text("Top Staking Assets").variant("h2").className("font-bold text-white tracking-tight text-3xl").build(),
                                       ]).build(),

                                       Row().gap(4).alignItems("center").children([
                                           Box().className("flex items-center bg-[#0F1014] border border-white/10 rounded-full px-5 py-3 gap-3 text-sm text-gray-400 w-80 focus-within:border-white/20 transition-all shadow-inner").children([
                                               Box().className("i-heroicons-magnifying-glass w-4 h-4 text-gray-500").build(),
                                               Text("Search assets...").className("opacity-40 font-medium text-xs flex-1").build(),
                                           ]).build(),

                                           Box().className("relative").children([
                                                Box().className("w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/5 cursor-pointer transition-colors").children(
                                                    Box().className("i-heroicons-bell w-5 h-5").build()
                                                ).build(),
                                                Box().className("absolute top-0 right-0 w-4 h-4 bg-[#6366f1] rounded-full border-2 border-[#0B0C15] flex items-center justify-center text-[9px] font-bold text-white").children("2").build()
                                           ]).build(),

                                           StakentButton({ text: "Settings", variant: "outline", className: "rounded-full h-12 px-6 text-xs text-gray-400 border-white/10" })
                                       ]).build()
                                   ])
                                   .build()
                           )

                           .children([
                               Box().className("p-10 overflow-y-auto h-full scrollbar-hide pb-32").children([

                                   Grid().columns({ sm: 1, md: 3 }).gap("xl").className("mb-10").children([

                                       StakentCard({ className: "h-[380px] p-8 hover:border-[#6366f1]/40 transition-all duration-500 group" }).children([
                                            Box().className("absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,rgba(99,102,241,0.15),transparent_60%)] opacity-50").build(),

                                            Row().className("justify-between mb-8 relative z-10").children([
                                                Row().gap(4).className("items-center").children([
                                                    Box().className("w-12 h-12 rounded-2xl bg-[#1A1B23] border border-white/5 flex items-center justify-center shadow-inner").children(
                                                        Image().src("https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Ethereum-icon-purple.svg/480px-Ethereum-icon-purple.svg.png").className("w-6 h-6").build()
                                                    ).build(),
                                                    Column().children([
                                                        Text("PROOF OF STAKE").className("text-[9px] font-bold text-gray-500 tracking-[0.15em] mb-1").build(),
                                                        Text("Ethereum (ETH)").className("font-bold text-white text-lg").build()
                                                    ]).build()
                                                ]).build(),
                                                Box().className("w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-gray-500 -rotate-45 group-hover:bg-white group-hover:text-black transition-all duration-300").children("→").build()
                                            ]).build(),

                                            Text("Reward Rate").className("text-xs font-medium text-gray-500 mb-1 relative z-10").build(),
                                            Text("13.62%").className("text-5xl font-bold text-white tracking-tight mb-3 relative z-10").build(),

                                            Row().gap(2).className("items-center mb-10 relative z-10").children([
                                                Box().className("w-4 h-4 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 text-[10px]").children("✓").build(),
                                                Text("6.25%").className("text-xs font-bold text-emerald-500").build(),
                                                Text("last 24h").className("text-[10px] text-gray-600").build()
                                            ]).build(),

                                            Box().className("absolute bottom-0 left-0 right-0 h-32 opacity-80").children([

                                                Box().className("absolute top-0 right-8 bg-[#151621] border border-white/10 px-3 py-1.5 rounded-lg text-[10px] font-bold text-white shadow-xl z-20").children("+$2,956").build(),

                                                Box().className("w-full h-full").children(

                                                    Box().className("w-full h-full bg-gradient-to-t from-[#6366f1]/10 to-transparent rounded-t-[100%] scale-150 translate-y-10").build()
                                                ).build()
                                            ]).build()
                                       ]).build(),

                                       StakentCard({ className: "h-[380px] p-8 hover:border-amber-500/40 transition-all duration-500 group" }).children([
                                            Box().className("absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,rgba(245,158,11,0.15),transparent_60%)] opacity-50").build(),

                                            Row().className("justify-between mb-8 relative z-10").children([
                                                Row().gap(4).className("items-center").children([
                                                    Box().className("w-12 h-12 rounded-2xl bg-[#1A1B23] border border-white/5 flex items-center justify-center shadow-inner").children(
                                                        Image().src("https://cryptologos.cc/logos/bnb-bnb-logo.png").className("w-6 h-6").build()
                                                    ).build(),
                                                    Column().children([
                                                        Text("PROOF OF STAKE").className("text-[9px] font-bold text-gray-500 tracking-[0.15em] mb-1").build(),
                                                        Text("BNB Chain").className("font-bold text-white text-lg").build()
                                                    ]).build()
                                                ]).build(),
                                                Box().className("w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-gray-500 -rotate-45 group-hover:bg-white group-hover:text-black transition-all duration-300").children("→").build()
                                            ]).build(),

                                            Text("Reward Rate").className("text-xs font-medium text-gray-500 mb-1 relative z-10").build(),
                                            Text("12.72%").className("text-5xl font-bold text-white tracking-tight mb-3 relative z-10").build(),

                                            Row().gap(2).className("items-center mb-10 relative z-10").children([
                                                Box().className("w-4 h-4 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 text-[10px]").children("✓").build(),
                                                Text("5.67%").className("text-xs font-bold text-emerald-500").build(),
                                                Text("last 24h").className("text-[10px] text-gray-600").build()
                                            ]).build(),

                                            Box().className("absolute bottom-0 left-0 right-0 h-32 opacity-80").children([
                                                Box().className("absolute top-0 right-8 bg-[#151621] border border-white/10 px-3 py-1.5 rounded-lg text-[10px] font-bold text-white shadow-xl z-20").children("+$2,009").build(),
                                                Box().className("w-full h-full bg-gradient-to-t from-amber-500/10 to-transparent rounded-t-[100%] scale-150 translate-y-10").build()
                                            ]).build()
                                       ]).build(),

                                       StakentCard({ className: "h-[380px] p-0 text-center flex flex-col items-center justify-center relative overflow-hidden group bg-[#151621]" }).children([
                                            Box().className("absolute inset-0 bg-[#151621]").build(),
                                            Box().className("absolute top-0 right-0 w-[400px] h-[400px] bg-[#6366f1]/20 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2").build(),
                                            Box().className("absolute bottom-0 left-0 w-[300px] h-[300px] bg-purple-500/20 blur-[80px] rounded-full translate-y-1/2 -translate-x-1/2").build(),

                                            Box().className("absolute top-6 right-6 z-20").children(
                                                StakentBadge({ text: "New", type: "new" })
                                            ).build(),

                                            Column().className("p-8 h-full w-full justify-between z-10 relative").children([
                                                Row().gap(2).className("items-center mb-8 justify-center opacity-70").children([
                                                     Text("Stakent").className("font-bold text-white text-sm tracking-tight").build(),
                                                     Box().className("w-1 h-1 rounded-full bg-white/50").build(),
                                                     Text("Liquid Staking").className("text-xs text-gray-400").build()
                                                ]).build(),

                                                Column().className("items-center mt-2").children([
                                                    Text("Liquid Staking Portfolio").className("font-bold text-white text-3xl mb-4 tracking-tight leading-none").build(),
                                                    Text("An all-in-one portfolio that helps you make smarter investments.").className("text-sm text-gray-400 leading-relaxed font-medium max-w-[260px]").build(),
                                                ]).build(),

                                                Column().gap(3).className("w-full mt-auto").children([
                                                    StakentButton({ text: "Connect with Wallet", variant: "gradient", className: "w-full py-3.5" }),
                                                    StakentButton({ text: "Enter a Wallet Address", variant: "secondary", icon: Box().className("i-heroicons-lock-closed w-3 h-3").build(), className: "w-full py-3 text-xs" })
                                                ]).build()
                                            ]).build()
                                       ]).build(),

                                   GridItem().colStart(1).colEnd(-1).className("col-span-full").children([
                                       StakentCard({ className: "p-8 h-full flex flex-col justify-center relative overflow-hidden" }).children([
                                            Box().className("absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2").build(),
                                            Text("Investment Period").className("text-white font-bold text-lg mb-1 relative z-10").build(),
                                            Text("Contribution Period (Month)").className("text-gray-500 text-xs mb-6 relative z-10").build(),

                                            Box().className("relative h-1 bg-white/10 rounded-full w-full mb-2 z-10").children([
                                                Box().className("absolute top-0 left-0 h-full w-3/4 bg-indigo-500 rounded-full").build(),
                                                Box().className("absolute top-1/2 left-3/4 w-4 h-4 bg-white rounded-full border-2 border-indigo-500 transform -translate-x-1/2 -translate-y-1/2 shadow-[0_0_10px_rgba(99,102,241,0.5)]").build(),
                                            ]).build(),

                                            Row().className("justify-between text-[10px] text-gray-400 mt-2 relative z-10").children([
                                                Text("Start").build(),
                                                Text("6 Months").className("text-white font-bold").build()
                                            ]).build()
                                       ]).build()
                                   ]).build()
                                   ]).build()
                            ]).build(),

                            Box().height(40).build(),

                            StakentCard({ className: "p-10 mb-20" }).children([
                               Row().className("justify-between items-start mb-8").children([
                                    Column().children([
                                        Row().gap(4).className("items-center mb-2").children([
                                            Text("Stake Avalanche (AVAX)").className("font-bold text-white text-2xl tracking-tight").build(),
                                            StakentBadge({ text: "HOT", type: "hot" })
                                        ]).build(),
                                        Row().gap(2).className("items-center").children([
                                            Box().className("w-1.5 h-1.5 rounded-full bg-gray-600").build(),
                                            Text("Last Update - 45 minutes ago").className("text-[10px] text-gray-500 font-bold uppercase tracking-wide").build()
                                        ]).build()
                                    ]).build(),

                                    StakentButton({ text: "View Profile", variant: "outline", icon: Box().className("i-heroicons-arrow-up-right w-3 h-3").build(), className: "text-xs h-9 px-4 rounded-lg" })
                               ]).build(),

                               Grid().columns({ sm: 1, md: 2 }).gap("xl").children([

                                    Column().className("justify-between").children([
                                        Box().className("mb-10").children([
                                            Text("Current Reward Balance, AVAX").className("text-xs text-gray-500 font-bold uppercase tracking-wider mb-2").build(),
                                            Row().className("items-baseline gap-4").children([
                                                Text("31.39686").className("text-7xl font-extrabold text-white tracking-tighter").build(),
                                                Text("AVAX").className("text-2xl text-gray-600 font-bold").build()
                                            ]).build(),
                                        ]).build(),

                                        Row().gap(4).children([
                                            StakentButton({ text: "Upgrade", variant: "gradient", className: "px-8 py-3 w-40" }),
                                            StakentButton({ text: "Unstake", variant: "secondary", className: "px-8 py-3 w-40" }),
                                        ]).build(),

                                        Grid().columns(3).gap("lg").className("mt-12 pt-8 border-t border-white/5").children([
                                            Column().children([
                                                Text("Momentum").className("text-xs text-white font-bold mb-1").build(),
                                                Text("Growth dynamics").className("text-[10px] text-gray-500").build()
                                            ]).build(),
                                            Column().children([
                                                Text("General").className("text-xs text-white font-bold mb-1").build(),
                                                Text("Overview").className("text-[10px] text-gray-500").build()
                                            ]).build(),
                                            Column().children([
                                                Text("Risk").className("text-xs text-white font-bold mb-1").build(),
                                                Text("Low Risk").className("text-[10px] text-emerald-500 font-bold uppercase").build()
                                            ]).build(),
                                        ]).build()
                                    ]).build(),

                                   Box().className("bg-[#1A1B23] border border-white/5 rounded-3xl p-8 relative overflow-hidden").children([

                                       Row().justifyContent("between").alignItems("center").className("mb-12").children([
                                           Column().children([
                                                Text("Investment Period").className("text-lg font-bold text-white mb-1").build(),
                                                Text("Contribution Period (Month)").className("text-xs text-gray-500").build(),
                                           ]).build(),
                                           Box().className("bg-[#2A2B36] px-3 py-1 rounded-lg text-xs font-bold text-gray-400").children("6 Month").build()
                                       ]).build(),

                                       Box().className("relative h-2 bg-[#0B0C15] rounded-full mb-8").children([
                                            Box().className("absolute left-0 top-0 bottom-0 w-[60%] bg-[#6366f1] rounded-full shadow-[0_0_15px_#6366f1]").build(),
                                            Box().className("absolute left-[60%] top-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-full border-4 border-[#1A1B23] shadow-lg cursor-pointer").build(),

                                            Box().className("absolute left-[60%] -top-10 -translate-x-1/2 bg-[#2A2B36] text-white text-[10px] font-bold px-2 py-1 rounded").children("4 Month").build()
                                       ]).build(),

                                        Row().justifyContent("between").className("border-t border-white/5 pt-6 mt-auto").children([
                                            Column().children([
                                                Text("Reward").className("text-xs text-gray-400 mb-1").build(),
                                                Text("Expected profit").className("text-[10px] text-gray-600").build()
                                            ]).build(),
                                            Column().crossAxisAlignment("end").children([
                                                Text("Reward Rate").className("text-xs text-gray-400 mb-1").build(),
                                                Row().gap(1).className("items-baseline").children([
                                                    Text("2.23%").className("text-white font-bold text-sm").build(),
                                                    Text("24h Ago").className("text-[10px] text-gray-500 font-normal").build()
                                                ]).build()
                                            ]).build()
                                        ]).build()

                                   ]).build()
                               ]).build()
                           ]).build(),

                        Box().height(100).build()

                        ]).build()
                    ]).build()

                ]).build()
            ]).build(),

        ]).build()

    ]).build()
  );
};

const App = () => (
    <FiboThemeProvider>
        <Gallery />
    </FiboThemeProvider>
);

if (typeof document !== 'undefined' && typeof window !== 'undefined') {
  const container = document.getElementById('root');
  if (container) {
    const root = window._reactRoot || (window._reactRoot = createRoot(container));
    root.render(<App />);
  }
}
