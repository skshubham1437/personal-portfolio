document.addEventListener("DOMContentLoaded", () => {
            
            const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            const isMobile = window.innerWidth < 768;

            const timeEl = document.getElementById('live-time');
            setInterval(() => {
                const time = new Date().toLocaleTimeString('en-US', { 
                    timeZone: 'Asia/Kolkata', hour12: true, hour: '2-digit', minute:'2-digit', second:'2-digit' 
                });
                if(timeEl) timeEl.innerText = time;
            }, 1000);

            const cursor = document.getElementById('cursor');
            let mouseX = window.innerWidth / 2, mouseY = window.innerHeight / 2;
            let cursorX = mouseX, cursorY = mouseY;

            if (window.matchMedia("(pointer: fine)").matches && !isReducedMotion) {
                window.addEventListener('mousemove', e => { mouseX = e.clientX; mouseY = e.clientY; });
                
                const renderCursor = () => {
                    cursorX += (mouseX - cursorX) * 0.15;
                    cursorY += (mouseY - cursorY) * 0.15;
                    cursor.style.left = `${cursorX}px`;
                    cursor.style.top = `${cursorY}px`;
                    requestAnimationFrame(renderCursor);
                };
                renderCursor();

                document.querySelectorAll('.hoverable, a, button, [tabindex="0"]').forEach(el => {
                    if(!el.classList.contains('project-item')) {
                        el.addEventListener('mouseenter', () => cursor.classList.add('active'));
                        el.addEventListener('mouseleave', () => cursor.classList.remove('active'));
                    }
                });

                document.querySelectorAll('.project-item').forEach(el => {
                    el.addEventListener('mouseenter', () => cursor.classList.add('view-mode'));
                    el.addEventListener('mouseleave', () => cursor.classList.remove('view-mode'));
                });
            } else {
                cursor.style.display = 'none';
            }

            const bootLogs = [
                "> fetching AWS endpoints...",
                "> compiling microservices...",
                "> resolving dependencies...",
                "> mapping connections...",
                "> bypass complete. entering system."
            ];
            const scrambleEl = document.getElementById('scramble-text');
            const pctEl = document.getElementById('loader-percent');
            
            let bootStep = 0;
            const bootInterval = setInterval(() => {
                if(bootStep < bootLogs.length) {
                    scrambleEl.innerHTML += `<br>${bootLogs[bootStep]}`;
                    bootStep++;
                }
            }, 250);

            let progress = { val: 0 };
            
            gsap.set(["#nav", "#h-kicker", "#h-title", "#h-sub", "#hero-actions"], { opacity: 0, y: 30 });

            gsap.to(progress, {
                val: 100, 
                duration: isReducedMotion ? 0.5 : 2.0, 
                ease: "power2.inOut",
                onUpdate: () => { pctEl.innerText = Math.floor(progress.val).toString().padStart(2, '0'); },
                onComplete: () => {
                    clearInterval(bootInterval);
                    const tl = gsap.timeline();
                    tl.to("#loader", { yPercent: -100, duration: isReducedMotion ? 0 : 1.2, ease: "expo.inOut" })
                      .to("#nav", { y: 0, opacity: 1, duration: 1, ease: "power3.out" }, "-=0.5")
                      .to("#h-kicker", { y: 0, opacity: 1, duration: 1, ease: "power4.out" }, "-=0.7")
                      .to("#h-title", { y: 0, opacity: 1, duration: 1.2, ease: "power4.out" }, "-=0.8")
                      .to("#h-sub", { y: 0, opacity: 1, duration: 1, ease: "power3.out" }, "-=0.9")
                      .to("#hero-actions", { y: 0, opacity: 1, duration: 0.9, ease: "power3.out" }, "-=0.8");
                }
            });

            const lenis = new Lenis({ 
                duration: 1.2, 
                easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
                smooth: !isReducedMotion
            });
            
            lenis.on('scroll', ScrollTrigger.update);
            gsap.ticker.add((time) => lenis.raf(time * 1000));
            gsap.ticker.lagSmoothing(0);

            document.querySelectorAll('[data-scroll-target]').forEach(el => {
                el.addEventListener('click', (event) => {
                    event.preventDefault();
                    const target = document.querySelector(el.getAttribute('data-scroll-target'));
                    if (!target) return;
                    if (isReducedMotion) {
                        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    } else {
                        lenis.scrollTo(target);
                    }
                });
            });

            document.querySelectorAll('.reveal-item').forEach(el => {
                gsap.fromTo(el, 
                    { y: isReducedMotion ? 0 : 40, opacity: 0 }, 
                    { y: 0, opacity: 1, duration: 1, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 85%", once: true } }
                );
            });

            const counters = document.querySelectorAll('.counter');
            counters.forEach(counter => {
                const target = parseFloat(counter.getAttribute('data-target'));
                const suffix = counter.getAttribute('data-suffix');
                const isFloat = target % 1 !== 0;
                
                gsap.to(counter, {
                    innerHTML: target,
                    duration: 2,
                    ease: "power2.out",
                    scrollTrigger: { trigger: counter, start: "top 85%", once: true },
                    onUpdate: function() {
                        const val = this.targets()[0].innerHTML;
                        counter.innerHTML = isFloat ? parseFloat(val).toFixed(1) + suffix : Math.round(val).toLocaleString() + suffix;
                    }
                });
            });

            if (!isReducedMotion) {
                const listItems = document.querySelectorAll('.list-item');
                lenis.on('scroll', (e) => {
                    const skewY = e.velocity * 0.4;
                    listItems.forEach(item => {
                        gsap.to(item, { skewY: gsap.utils.clamp(-8, 8, skewY), duration: 0.5, ease: "power3.out", overwrite: true });
                    });
                });

                let scrollTimeout;
                window.addEventListener('scroll', () => {
                    clearTimeout(scrollTimeout);
                    scrollTimeout = setTimeout(() => {
                        gsap.to(listItems, { skewY: 0, duration: 0.8, ease: "elastic.out(1, 0.3)" });
                    }, 50);
                });
            }

            const projectItems = document.querySelectorAll('.list-item-wrapper');
            projectItems.forEach(wrapper => {
                const header = wrapper.querySelector('.project-item');
                const drawer = wrapper.querySelector('.project-drawer');

                const toggleProject = () => {
                    const isActive = header.classList.contains('active');
                    
                    document.querySelectorAll('.project-item').forEach(el => {
                        el.classList.remove('active');
                        el.setAttribute('aria-expanded', 'false');
                    });
                    document.querySelectorAll('.project-drawer').forEach(el => gsap.to(el, {height: 0, duration: 0.5, ease: "power3.inOut"}));
                    
                    if (!isActive) {
                        header.classList.add('active');
                        header.setAttribute('aria-expanded', 'true');
                        gsap.to(drawer, {height: "auto", duration: 0.5, ease: "power3.inOut"});
                    }
                };

                header.addEventListener('click', toggleProject);
                header.addEventListener('keydown', (event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        toggleProject();
                    }
                });
            });

            const contactForm = document.getElementById('contact-form');
            if (contactForm) {
                contactForm.addEventListener('submit', (event) => {
                    event.preventDefault();
                    const formData = new FormData(contactForm);
                    const name = String(formData.get('name') || '').trim();
                    const email = String(formData.get('email') || '').trim();
                    const message = String(formData.get('message') || '').trim();
                    const subject = encodeURIComponent(`Portfolio inquiry from ${name}`);
                    const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}`);
                    window.location.href = `mailto:skshubham1437@gmail.com?subject=${subject}&body=${body}`;
                });
            }

            if (!isMobile && !isReducedMotion) {
                const canvas = document.getElementById('webgl-canvas');
                const scene = new THREE.Scene();
                const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
                const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false });
                
                renderer.setSize(window.innerWidth, window.innerHeight);
                renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));

                const fragmentShader = `
                    uniform float u_time;
                    uniform vec2 u_mouse;
                    uniform vec2 u_resolution;
                    uniform float u_intensity;

                    vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
                    float snoise(vec2 v){
                        const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
                        vec2 i  = floor(v + dot(v, C.yy) );
                        vec2 x0 = v -   i + dot(i, C.xx);
                        vec2 i1;
                        i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
                        vec4 x12 = x0.xyxy + C.xxzz;
                        x12.xy -= i1;
                        i = mod(i, 289.0);
                        vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 )) + i.x + vec3(0.0, i1.x, 1.0 ));
                        vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
                        m = m*m; m = m*m;
                        vec3 x = 2.0 * fract(p * C.www) - 1.0;
                        vec3 h = abs(x) - 0.5;
                        vec3 ox = floor(x + 0.5);
                        vec3 a0 = x - ox;
                        m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
                        vec3 g;
                        g.x  = a0.x  * x0.x  + h.x  * x0.y;
                        g.yz = a0.yz * x12.xz + h.yz * x12.yw;
                        return 130.0 * dot(m, g);
                    }

                    void main() {
                        vec2 st = gl_FragCoord.xy / u_resolution.xy;
                        st.x *= u_resolution.x / u_resolution.y;
                        
                        vec2 mouse = u_mouse / u_resolution;
                        
                        float dist = distance(st, vec2(mouse.x * (u_resolution.x/u_resolution.y), 1.0 - mouse.y));
                        
                        float noiseFreq = 3.0 + (u_intensity * 20.0);
                        float timeMult = 0.2 + (u_intensity * 2.0);
                        
                        float distortion = snoise(st * noiseFreq + u_time * timeMult) * (0.5 + u_intensity);
                        
                        float wave = sin(dist * (10.0 + u_intensity * 50.0) - u_time * (2.0 + u_intensity * 10.0) + distortion) * exp(-dist * 2.0);
                        
                        float r = snoise(st * noiseFreq + wave + u_time) * u_intensity * 0.15;
                        float b = snoise(st * noiseFreq - wave - u_time) * u_intensity * 0.15;
                        
                        vec3 color = vec3(0.04);
                        color += vec3(0.1 + r, 0.1, 0.1 + b) * wave;
                        
                        float scanlines = sin(st.y * 800.0) * 0.04 * u_intensity;
                        color -= scanlines;

                        gl_FragColor = vec4(color, 1.0);
                    }
                `;

                const geometry = new THREE.PlaneGeometry(2, 2);
                const uniforms = {
                    u_time: { value: 0 },
                    u_mouse: { value: new THREE.Vector2(mouseX, mouseY) },
                    u_resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
                    u_intensity: { value: 0.0 }
                };

                const shaderMaterial = new THREE.ShaderMaterial({
                    vertexShader: `void main() { gl_Position = vec4(position, 1.0); }`,
                    fragmentShader: fragmentShader,
                    uniforms: uniforms
                });

                const mesh = new THREE.Mesh(geometry, shaderMaterial);
                scene.add(mesh);

                window.addEventListener('mousemove', (e) => {
                    gsap.to(uniforms.u_mouse.value, { x: e.clientX, y: e.clientY, duration: 1.0, ease: "power2.out" });
                });

                document.querySelectorAll('.project-item').forEach(el => {
                    el.addEventListener('mouseenter', () => { gsap.to(uniforms.u_intensity, { value: 1.0, duration: 0.5, ease: "power2.out" }); });
                    el.addEventListener('mouseleave', () => { gsap.to(uniforms.u_intensity, { value: 0.0, duration: 0.8, ease: "power2.out" }); });
                });

                const clock = new THREE.Clock();
                function animate() {
                    uniforms.u_time.value = clock.getElapsedTime();
                    renderer.render(scene, camera);
                    requestAnimationFrame(animate);
                }
                animate();

                window.addEventListener('resize', () => {
                    renderer.setSize(window.innerWidth, window.innerHeight);
                    uniforms.u_resolution.value.set(window.innerWidth, window.innerHeight);
                });
            }
        });



