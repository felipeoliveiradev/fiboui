package theme

import "fmt"

type Palette struct {
	Editor  string
	Accent  string
	Keyword string
	String  string
	Comment string
	Number  string
}

func Noir() Palette {
	return Palette{
		Editor:  "#0C0C0E",
		Accent:  "#4EC9B0",
		Keyword: "#C4B5FD",
		String:  "#CE9178",
		Comment: "#71717A",
		Number:  "#B5CEA8",
	}
}

func main() {
	p := Noir()
	fmt.Printf("accent %s on %s\n", p.Accent, p.Editor)
}
