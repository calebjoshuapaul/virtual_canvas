export default function PageLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<main className="flex min-h-screen flex-col items-center justify-between p-24">
			<div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm flex flex-col gap-8">
				<div>
					<h1 className="text-6xl">Virtual Canvas</h1>
					<p>
						Lorem ipsum dolor sit amet, consectetur adipisicing elit. Fugit
						quaerat sed ex distinctio facilis dolore quod enim placeat deserunt
						necessitatibus nam repellendus, praesentium totam ullam rem
						perferendis labore aliquid tempora.
					</p>
				</div>
				{children}
			</div>
		</main>
	);
}
